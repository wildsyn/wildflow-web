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
import { z } from 'zod'

export const voiceFormSchema = z
  .object({
    voice_id: z.string().min(1),
    text: z
      .string()
      .trim()
      .min(1)
      .refine(
        (value) => new TextEncoder().encode(value).length <= 8192,
        'Script exceeds 8192 UTF-8 bytes'
      ),
    lang: z.enum(['zh', 'en', 'ja', 'es', 'ar']),
    duration_factor: z.number().min(0.5).max(2),
    emotion_mode: z.enum(['reference', 'text', 'auto', 'vector', 'audio']),
    emo_text: z.string().max(2048),
    emotion_voice_id: z.string(),
    emo_vector: z.array(z.number().min(0).max(1)).length(8),
    emo_alpha: z.number().min(0).max(1),
    stream: z.boolean(),
    use_random: z.boolean(),
    text_normalization: z.boolean(),
    interval_silence: z.number().int().min(0).max(2000),
    max_text_tokens_per_segment: z.number().int().min(20).max(200),
    do_sample: z.boolean(),
    top_p: z.number().min(0.01).max(1),
    top_k: z.number().int().min(1).max(100),
    temperature: z.number().min(0.1).max(2),
    repetition_penalty: z.number().min(0.1).max(20),
  })
  .superRefine((value, ctx) => {
    if (value.emotion_mode === 'text' && !value.emo_text.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['emo_text'],
        message: 'Emotion description is required',
      })
    }
    if (value.emotion_mode === 'audio' && !value.emotion_voice_id) {
      ctx.addIssue({
        code: 'custom',
        path: ['emotion_voice_id'],
        message: 'Emotion reference is required',
      })
    }
  })
export type VoiceForm = z.infer<typeof voiceFormSchema>
export const voiceDefaults: VoiceForm = {
  voice_id: '',
  text: '',
  lang: 'zh',
  duration_factor: 1,
  emotion_mode: 'reference',
  emo_text: '',
  emotion_voice_id: '',
  emo_vector: [0, 0, 0, 0, 0, 0, 0, 1],
  emo_alpha: 1,
  stream: false,
  use_random: false,
  text_normalization: true,
  interval_silence: 200,
  max_text_tokens_per_segment: 120,
  do_sample: true,
  top_p: 0.8,
  top_k: 30,
  temperature: 0.8,
  repetition_penalty: 10,
}
export function synthesisParameters(
  values: VoiceForm
): Record<string, unknown> {
  const {
    emotion_mode,
    emo_text,
    emotion_voice_id,
    emo_vector,
    ...parameters
  } = voiceFormSchema.parse(values)
  const result: Record<string, unknown> = { ...parameters }
  if (emotion_mode === 'text' || emotion_mode === 'auto') {
    result.use_emo_text = true
  }
  if (emotion_mode === 'text') result.emo_text = emo_text
  if (emotion_mode === 'audio') result.emotion_voice_id = emotion_voice_id
  if (emotion_mode === 'vector') result.emo_vector = emo_vector
  return result
}
