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
// ============================================================================
// Home Page Types
// ============================================================================

/**
 * Response from home page content API
 */
export interface HomePageContentResponse {
  success: boolean
  message?: string
  data?: string
}

/**
 * Home page content result from hook
 */
export interface HomePageContentResult {
  content: string
  isLoaded: boolean
  isUrl: boolean
}

export interface WildFlowOffering {
  id: 'VoxCPM2' | 'FLUX.2 [klein] 4B' | 'wildflow/dual-asr-v1' | 'wildflow/whisper-asr-v1' | 'wildflow/vibevoice-asr-v1'
  display_name: string
  kind: 'tts' | 'image' | 'asr'
  vendor: string
  model_version_ref: string
  description: string
  required_parameters?: string[]
  voices?: WildFlowVoice[]
  pricing: WildFlowCatalogPricing
  callable: boolean
  status: 'available' | 'unavailable'
}

export interface WildFlowVoice {
  id: string
  name: string
  category: 'official' | 'custom'
}

export interface WildFlowCatalogPricing {
  currency: 'CNY'
  amount: number
  unit: '10k_characters' | 'image' | 'audio_minute' | 'team_trial'
  display: string
}

export interface WildFlowCatalogResult {
  offerings: WildFlowOffering[]
  isLoaded: boolean
}
