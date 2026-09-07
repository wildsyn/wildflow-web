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
export type Voice = {
  kind?: string
  voice_id: string
  name: string
  sha256: string
  media_type: string
  size_bytes: number
  duration_ms: number
  sample_rate: number
  source: string
  preview_url?: string
  retention_state: string
}
export type VoiceJob = {
  id: string
  state: string
  error?: string
  artifacts?: { id: string; sha256: string }[]
}
