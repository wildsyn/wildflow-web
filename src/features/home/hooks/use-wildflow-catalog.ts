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
import { useEffect, useState } from 'react'

import { getWildFlowCatalog } from '../api'
import type { WildFlowCatalogResult, WildFlowOffering } from '../types'

const OFFERING_IDS = [
  'VoxCPM2',
  'FLUX.2 [klein] 4B',
  'wildflow/internal-vibevoice-faster-whisper-asr-v1',
] as const

function isPricing(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const pricing = value as Record<string, unknown>
  if (
    pricing.currency !== 'CNY' ||
    typeof pricing.amount !== 'number' ||
    !Number.isFinite(pricing.amount) ||
    typeof pricing.display !== 'string'
  ) {
    return false
  }
  const supportedUnit =
    pricing.unit === '10k_characters' ||
    pricing.unit === 'image' ||
    pricing.unit === 'team_trial'
  const validAmount =
    pricing.unit === 'team_trial' ? pricing.amount === 0 : pricing.amount > 0
  return supportedUnit && validAmount
}

function isVoice(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const voice = value as Record<string, unknown>
  return (
    typeof voice.id === 'string' &&
    typeof voice.name === 'string' &&
    (voice.category === 'official' || voice.category === 'custom')
  )
}

function isOffering(value: unknown): value is WildFlowOffering {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    OFFERING_IDS.includes(item.id as (typeof OFFERING_IDS)[number]) &&
    (item.kind === 'tts' || item.kind === 'image' || item.kind === 'asr') &&
    typeof item.display_name === 'string' &&
    typeof item.vendor === 'string' &&
    typeof item.model_version_ref === 'string' &&
    typeof item.description === 'string' &&
    (item.required_parameters === undefined ||
      (Array.isArray(item.required_parameters) &&
        item.required_parameters.every(
          (parameter) => typeof parameter === 'string'
        ))) &&
    (item.voices === undefined ||
      (Array.isArray(item.voices) && item.voices.every(isVoice))) &&
    isPricing(item.pricing) &&
    typeof item.callable === 'boolean'
  )
}

export function normalizeWildFlowCatalog(value: unknown): WildFlowOffering[] {
  if (!Array.isArray(value)) return []
  return OFFERING_IDS.flatMap((id) => {
    const item = value.find(
      (candidate) => isOffering(candidate) && candidate.id === id
    )
    // The catalog is entitlement-aware. Do not turn an unavailable entry into
    // a discoverable model for anonymous or unauthorized visitors.
    if (!item || !isOffering(item) || !item.callable) return []
    return [
      {
        ...item,
        status: item.callable ? 'available' : 'unavailable',
      },
    ]
  })
}

export function useWildFlowCatalog(): WildFlowCatalogResult {
  const [offerings, setOfferings] = useState<WildFlowOffering[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadCatalog = async () => {
      try {
        const response = await getWildFlowCatalog()
        if (mounted) {
          setOfferings(
            response.success ? normalizeWildFlowCatalog(response.data) : []
          )
        }
      } catch (error) {
        if (mounted) {
          setOfferings([])
          // eslint-disable-next-line no-console
          console.error('Failed to load WildFlow model catalog:', error)
        }
      } finally {
        if (mounted) setIsLoaded(true)
      }
    }

    loadCatalog()
    return () => {
      mounted = false
    }
  }, [])

  return { offerings, isLoaded }
}
