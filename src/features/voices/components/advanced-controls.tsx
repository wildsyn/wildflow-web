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
import type { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

import type { VoiceForm } from '../lib/schema'
import type { Voice } from '../types'

type Props = { form: UseFormReturn<VoiceForm>; voices: Voice[] }
export function AdvancedControls(props: Props) {
  const { t } = useTranslation()
  const emotion = props.form.watch('emotion_mode')
  return (
    <Collapsible>
      <CollapsibleTrigger render={<Button type='button' variant='outline' />}>
        {t('Advanced controls')}
      </CollapsibleTrigger>
      <CollapsibleContent className='mt-4 space-y-4'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='emotion-mode'>{t('Emotion guidance')}</Label>
            <NativeSelect
              id='emotion-mode'
              {...props.form.register('emotion_mode')}
            >
              <NativeSelectOption value='reference'>
                {t('Follow the voice')}
              </NativeSelectOption>
              <NativeSelectOption value='text'>
                {t('Describe an emotion')}
              </NativeSelectOption>
              <NativeSelectOption value='auto'>
                {t('Infer emotion from script')}
              </NativeSelectOption>
              <NativeSelectOption value='vector'>
                {t('Mix emotions')}
              </NativeSelectOption>
              <NativeSelectOption value='audio'>
                {t('Use emotion audio')}
              </NativeSelectOption>
            </NativeSelect>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='emo-alpha'>{t('Emotion strength')}</Label>
            <Input
              id='emo-alpha'
              type='number'
              min={0}
              max={1}
              step={0.05}
              {...props.form.register('emo_alpha', { valueAsNumber: true })}
            />
          </div>
        </div>
        {emotion === 'text' && (
          <div className='space-y-2'>
            <Label htmlFor='emo-text'>{t('Emotion description')}</Label>
            <Input id='emo-text' {...props.form.register('emo_text')} />
          </div>
        )}
        {emotion === 'audio' && (
          <div className='space-y-2'>
            <Label htmlFor='emo-voice'>{t('Emotion reference')}</Label>
            <NativeSelect
              id='emo-voice'
              {...props.form.register('emotion_voice_id')}
            >
              <NativeSelectOption value=''>
                {t('Select voice')}
              </NativeSelectOption>
              {props.voices.map((voice) => (
                <NativeSelectOption key={voice.voice_id} value={voice.voice_id}>
                  {voice.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        )}
        {emotion === 'vector' && (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
            {[
              'Happy',
              'Angry',
              'Sad',
              'Afraid',
              'Disgusted',
              'Melancholic',
              'Surprised',
              'Calm',
            ].map((label, index) => (
              <div key={label} className='space-y-2'>
                <Label htmlFor={`emotion-${index}`}>{t(label)}</Label>
                <Input
                  id={`emotion-${index}`}
                  type='number'
                  min={0}
                  max={1}
                  step={0.05}
                  {...props.form.register(`emo_vector.${index}`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
            ))}
          </div>
        )}
        <div className='grid gap-4 sm:grid-cols-2'>
          {(
            [
              {
                key: 'interval_silence',
                label: 'Segment silence (ms)',
                min: 0,
                max: 2000,
                step: 1,
              },
              {
                key: 'max_text_tokens_per_segment',
                label: 'Tokens per segment',
                min: 20,
                max: 200,
                step: 1,
              },
              {
                key: 'temperature',
                label: 'Sampling temperature',
                min: 0.1,
                max: 2,
                step: 0.1,
              },
              { key: 'top_p', label: 'Top P', min: 0.01, max: 1, step: 0.01 },
              { key: 'top_k', label: 'Top K', min: 1, max: 100, step: 1 },
              {
                key: 'repetition_penalty',
                label: 'Repetition penalty',
                min: 0.1,
                max: 20,
                step: 0.1,
              },
            ] as const
          ).map((field) => (
            <div key={field.key} className='space-y-2'>
              <Label htmlFor={field.key}>{t(field.label)}</Label>
              <Input
                id={field.key}
                type='number'
                min={field.min}
                max={field.max}
                step={field.step}
                {...props.form.register(field.key, { valueAsNumber: true })}
              />
            </div>
          ))}
        </div>
        <div className='flex flex-wrap gap-4'>
          {(
            [
              { key: 'text_normalization', label: 'Normalize text' },
              { key: 'use_random', label: 'Randomize emotion style' },
              { key: 'do_sample', label: 'Sample speech tokens' },
            ] as const
          ).map((field) => (
            <div key={field.key} className='flex items-center gap-2'>
              <Checkbox
                id={field.key}
                checked={props.form.watch(field.key)}
                onCheckedChange={(checked) =>
                  props.form.setValue(field.key, checked)
                }
              />
              <Label htmlFor={field.key}>{t(field.label)}</Label>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
