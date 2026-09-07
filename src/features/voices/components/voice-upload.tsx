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
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TitledCard } from '@/components/ui/titled-card'
import { handleServerError } from '@/lib/handle-server-error'

import { uploadVoice } from '../api'
import type { Voice } from '../types'

const schema = z.object({
  name: z.string().trim().min(1).max(60),
  audio: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, 'Choose a WAV recording'),
})
export function VoiceUpload(props: { onCreated: (voice: Voice) => void }) {
  const { t } = useTranslation()
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  })
  const upload = useMutation({
    mutationFn: (values: z.infer<typeof schema>) =>
      uploadVoice(values.audio[0], values.name),
    onSuccess: (voice) => {
      props.onCreated(voice)
      form.reset()
    },
    onError: handleServerError,
  })
  return (
    <TitledCard
      title={t('Create a voice')}
      description={t(
        'Upload a recording you have permission to use. PCM16 WAV, 1–15 seconds, 8–192 kHz, mono or stereo. No reference transcript is required.'
      )}
      disableHoverEffect
    >
      <form
        onSubmit={form.handleSubmit((values) => upload.mutate(values))}
        className='space-y-3'
      >
        <Label htmlFor='voice-name'>{t('Voice name')}</Label>
        <Input id='voice-name' {...form.register('name')} />
        <Label htmlFor='voice-audio'>{t('Reference recording')}</Label>
        <Input
          id='voice-audio'
          type='file'
          accept='.wav,audio/wav'
          {...form.register('audio')}
        />
        {(form.formState.errors.name || form.formState.errors.audio) && (
          <p role='alert'>{t('Enter a name and choose one WAV recording.')}</p>
        )}
        {upload.isError && (
          <p role='alert'>
            {t('Voice upload failed. Check the audio format and try again.')}
          </p>
        )}
        <Button type='submit' disabled={upload.isPending}>
          {upload.isPending ? t('Uploading') : t('Create voice')}
        </Button>
      </form>
    </TitledCard>
  )
}
