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
import { api } from '@/lib/api'

import { synthesisParameters, type VoiceForm } from './lib/schema'
import type { Voice, VoiceJob } from './types'

export async function getVoices(): Promise<Voice[]> {
  const voices: Voice[] = []
  let cursor = ''
  do {
    const response = await api.get<{ data: Voice[]; next_cursor: string }>(
      '/api/user/self/voices',
      { params: { after: cursor } }
    )
    voices.push(...response.data.data)
    cursor = response.data.next_cursor
  } while (cursor)
  return voices
}
export type VoicePreference = {
  voice_id: string
  content_accounts?: Record<string, string> | null
}
export async function getPreference(): Promise<VoicePreference> {
  return (await api.get<VoicePreference>('/api/user/self/voice-preference'))
    .data
}
export async function savePreference(preference: {
  voice_id: string
  content_account: string
}): Promise<void> {
  await api.put('/api/user/self/voice-preference', preference)
}
export async function uploadVoice(file: File, name: string): Promise<Voice> {
  if (file.size > 12 * 1024 * 1024) throw new Error('Voice exceeds 12 MiB')
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
  const sha = Array.from(new Uint8Array(digest), (n) =>
    n.toString(16).padStart(2, '0')
  ).join('')
  return (
    await api.post<Voice>('/api/user/self/voices', file, {
      headers: {
        'Content-Type': 'audio/wav',
        'X-WildFlow-Content-SHA256': sha,
        'X-WildFlow-Voice-Name': encodeURIComponent(name),
      },
    })
  ).data
}
export async function createSpeech(
  values: VoiceForm,
  idempotencyKey: string
): Promise<VoiceJob> {
  return (
    await api.post<VoiceJob>(
      '/api/user/self/voice-jobs',
      { model: 'IndexTTS-2.5', parameters: synthesisParameters(values) },
      { headers: { 'Idempotency-Key': idempotencyKey } }
    )
  ).data
}
export async function getSpeech(id: string): Promise<VoiceJob> {
  return (
    await api.get<VoiceJob>(
      `/api/user/self/voice-jobs/${encodeURIComponent(id)}`
    )
  ).data
}
export async function voicePreview(voice: Voice): Promise<string> {
  if (voice.preview_url) {
    const url = new URL(voice.preview_url)
    if (url.protocol !== 'https:' || url.hostname !== 'huggingface.co') {
      throw new Error('Invalid preview URL')
    }
    return url.href
  }
  const response = await api.get<Blob>(
    `/api/user/self/voices/${encodeURIComponent(voice.voice_id)}/content`,
    { responseType: 'blob' }
  )
  return URL.createObjectURL(response.data)
}
export async function speechAudio(id: string): Promise<string> {
  const response = await api.get<Blob>(
    `/api/user/self/voice-artifacts/${encodeURIComponent(id)}/content`,
    { responseType: 'blob' }
  )
  return URL.createObjectURL(response.data)
}
