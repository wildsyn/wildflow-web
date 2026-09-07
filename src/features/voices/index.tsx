/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { ErrorState } from '@/components/error-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { TitledCard } from '@/components/ui/titled-card'
import { handleServerError } from '@/lib/handle-server-error'

import {
  createSpeech,
  getPreference,
  getSpeech,
  getVoices,
  savePreference,
  speechAudio,
  voicePreview,
} from './api'
import { AdvancedControls } from './components/advanced-controls'
import { LiveSpeech } from './components/live-speech'
import { VoiceUpload } from './components/voice-upload'
import { voiceDefaults, voiceFormSchema, type VoiceForm } from './lib/schema'
import type { VoiceJob } from './types'

const completed = new Set([
  'succeeded',
  'failed',
  'cancelled',
  'recovery_required',
])
export function VoiceStudio() {
  const { t } = useTranslation()
  const client = useQueryClient()
  const voices = useQuery({
    queryKey: ['indextts', 'voices'],
    queryFn: getVoices,
  })
  const preference = useQuery({
    queryKey: ['indextts', 'preference'],
    queryFn: getPreference,
  })
  const form = useForm<VoiceForm>({
    resolver: zodResolver(voiceFormSchema),
    defaultValues: voiceDefaults,
  })
  const [contentAccount, setContentAccount] = useState('')
  const preferredVoice = contentAccount.trim()
    ? preference.data?.content_accounts?.[contentAccount.trim()]
    : preference.data?.voice_id
  const selected = form.watch('voice_id')
  const text = form.watch('text')
  const [job, setJob] = useState<VoiceJob | null>(null)
  const [audio, setAudio] = useState('')
  const [streamJob, setStreamJob] = useState(false)
  const pending = useRef<{ signature: string; key: string } | null>(null)
  const status = useQuery({
    queryKey: ['indextts', 'job', job?.id],
    queryFn: () => {
      if (!job) throw new Error('No speech task')
      return getSpeech(job.id)
    },
    enabled: Boolean(job && !completed.has(job.state)),
    refetchInterval: (query) =>
      completed.has(query.state.data?.state ?? '') ? false : 2000,
  })
  const current = status.data ?? job
  const busy = Boolean(current && !completed.has(current.state))
  const voice = voices.data?.find((item) => item.voice_id === selected)
  useEffect(() => {
    if (
      !form.getValues('voice_id') &&
      preferredVoice &&
      voices.data?.some((item) => item.voice_id === preferredVoice)
    ) {
      form.setValue('voice_id', preferredVoice)
    }
  }, [preferredVoice, voices.data, form])
  useEffect(
    () => () => {
      if (audio.startsWith('blob:')) URL.revokeObjectURL(audio)
    },
    [audio]
  )
  const save = useMutation({
    mutationFn: savePreference,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ['indextts', 'preference'] }),
    onError: handleServerError,
  })
  const preview = useMutation({
    mutationFn: async () => {
      if (!voice) throw new Error('Select a voice')
      return voicePreview(voice)
    },
    onSuccess: setAudio,
    onError: handleServerError,
  })
  const download = useMutation({
    mutationFn: speechAudio,
    onSuccess: setAudio,
    onError: handleServerError,
  })
  const generate = useMutation({
    mutationFn: (values: VoiceForm) => {
      const signature = JSON.stringify(values)
      if (pending.current?.signature !== signature) {
        pending.current = { signature, key: crypto.randomUUID() }
      }
      return createSpeech(values, pending.current.key)
    },
    onSuccess: (result, values) => {
      setStreamJob(values.stream)
      setJob(result)
      pending.current = null
      setAudio('')
    },
    onError: handleServerError,
  })
  if (voices.isError) {
    return (
      <ErrorState
        title={t('Unable to load voices')}
        onRetry={() => void voices.refetch()}
      />
    )
  }
  return (
    <div className='grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]'>
      <TitledCard
        title={t('Voice studio')}
        description={t(
          'Keep a consistent voice across content batches with IndexTTS-2.5.'
        )}
        disableHoverEffect
      >
        <form
          onSubmit={form.handleSubmit((values) => generate.mutate(values))}
          className='space-y-5'
        >
          <div className='space-y-2'>
            <Label htmlFor='voice-content-account'>
              {t('Content account (optional)')}
            </Label>
            <Input
              id='voice-content-account'
              list='voice-content-accounts'
              maxLength={60}
              value={contentAccount}
              disabled={busy}
              onChange={(event) => {
                setContentAccount(event.target.value)
                form.setValue('voice_id', '')
              }}
              placeholder={t('For example, book reviews or podcasts')}
            />
            <datalist id='voice-content-accounts'>
              {Object.keys(preference.data?.content_accounts ?? {})
                .sort()
                .map((account) => (
                  <option key={account} value={account} />
                ))}
            </datalist>
            <p className='text-muted-foreground text-xs'>
              {t(
                'Save a different default voice for each content account. Leave blank to use your general default.'
              )}
            </p>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='voice-select'>{t('Voice')}</Label>
            <NativeSelect
              id='voice-select'
              className='w-full'
              disabled={voices.isPending || busy}
              {...form.register('voice_id')}
            >
              <NativeSelectOption value=''>
                {t('Select voice')}
              </NativeSelectOption>
              {voices.data
                ?.filter((item) => item.kind !== 'emotion')
                .map((item) => (
                  <NativeSelectOption key={item.voice_id} value={item.voice_id}>
                    {item.name}
                  </NativeSelectOption>
                ))}
            </NativeSelect>
            <div className='flex flex-wrap items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                disabled={!voice || preview.isPending}
                onClick={() => preview.mutate()}
              >
                {t('Preview voice')}
              </Button>
              <Button
                type='button'
                variant='outline'
                disabled={!voice || save.isPending}
                onClick={() =>
                  save.mutate({
                    voice_id: selected,
                    content_account: contentAccount.trim(),
                  })
                }
              >
                {preferredVoice === selected && selected
                  ? t('Default voice')
                  : t('Set as default')}
              </Button>
              {selected && (
                <CopyButton value={selected} aria-label={t('Copy voice ID')} />
              )}
            </div>
            {selected && (
              <p className='text-muted-foreground text-xs break-all'>
                {selected}
              </p>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='voice-script'>{t('Script')}</Label>
            <Textarea
              id='voice-script'
              rows={6}
              {...form.register('text')}
              aria-invalid={Boolean(form.formState.errors.text)}
            />
            <p className='text-muted-foreground text-xs'>
              {t(
                'Up to 8192 UTF-8 bytes. Pronunciation annotations such as <行|XING2> are supported.'
              )}
            </p>
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='voice-lang'>{t('Language')}</Label>
              <NativeSelect id='voice-lang' {...form.register('lang')}>
                <NativeSelectOption value='zh'>
                  {t('Chinese')}
                </NativeSelectOption>
                <NativeSelectOption value='en'>
                  {t('English')}
                </NativeSelectOption>
                <NativeSelectOption value='ja'>
                  {t('Japanese')}
                </NativeSelectOption>
                <NativeSelectOption value='es'>
                  {t('Spanish')}
                </NativeSelectOption>
                <NativeSelectOption value='ar'>
                  {t('Arabic')}
                </NativeSelectOption>
              </NativeSelect>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='voice-duration'>{t('Duration factor')}</Label>
              <Input
                id='voice-duration'
                type='number'
                min={0.5}
                max={2}
                step={0.1}
                {...form.register('duration_factor', { valueAsNumber: true })}
              />
              <p className='text-muted-foreground text-xs'>
                {t('A larger value speaks more slowly.')}
              </p>
            </div>
          </div>
          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              {...form.register('stream')}
              disabled={busy}
            />
            {t('Listen while generating')}
          </label>
          <AdvancedControls form={form} voices={voices.data ?? []} />
          {Object.keys(form.formState.errors).length > 0 && (
            <p role='alert'>{t('Check the script and synthesis controls.')}</p>
          )}
          {generate.isError && (
            <p role='alert'>
              {t(
                'Submission failed. Retrying unchanged input reuses the same request ID.'
              )}
            </p>
          )}
          <Button
            type='submit'
            disabled={!selected || !text.trim() || generate.isPending || busy}
          >
            {t('Generate speech')}
          </Button>
        </form>
        {current && (
          <div className='mt-4 space-y-3' aria-live='polite'>
            <p>
              {t('Task status')}: {t(current.state)}
            </p>
            {streamJob && (
              <LiveSpeech
                key={current.id}
                job={current.id}
                done={completed.has(current.state)}
              />
            )}
            <CopyButton value={current.id} aria-label={t('Copy task ID')} />
            {current.state === 'succeeded' && current.artifacts?.[0] && (
              <Button
                disabled={download.isPending}
                onClick={() =>
                  current.artifacts?.[0] &&
                  download.mutate(current.artifacts[0].id)
                }
              >
                {t('Load audio')}
              </Button>
            )}
            {status.isError && (
              <Button variant='outline' onClick={() => void status.refetch()}>
                {t('Refresh task')}
              </Button>
            )}
          </div>
        )}
        {audio && (
          <div className='mt-4 space-y-2'>
            <audio
              controls
              src={audio}
              className='w-full'
              aria-label={t('Speech audio')}
            />
            {audio.startsWith('blob:') && (
              <a
                href={audio}
                download='indextts.wav'
                className='text-primary underline'
              >
                {t('Download WAV')}
              </a>
            )}
          </div>
        )}
      </TitledCard>
      <VoiceUpload
        onCreated={(created) => {
          form.setValue('voice_id', created.voice_id)
          void client.invalidateQueries({ queryKey: ['indextts', 'voices'] })
        }}
      />
    </div>
  )
}
