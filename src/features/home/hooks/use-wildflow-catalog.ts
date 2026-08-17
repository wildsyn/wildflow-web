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

const OFFERING_IDS = ['tts-standard', 'tts-premium', 'flux2-klein-4b'] as const

function isOffering(value: unknown): value is WildFlowOffering {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    OFFERING_IDS.includes(item.id as (typeof OFFERING_IDS)[number]) &&
    (item.kind === 'tts' || item.kind === 'image') &&
    typeof item.display_name === 'string' &&
    typeof item.vendor === 'string' &&
    typeof item.model_version_ref === 'string' &&
    typeof item.profile === 'string' &&
    typeof item.description === 'string' &&
    typeof item.callable === 'boolean'
  )
}

export function normalizeWildFlowCatalog(value: unknown): WildFlowOffering[] {
  if (!Array.isArray(value)) return []
  return OFFERING_IDS.flatMap((id) => {
    const item = value.find(
      (candidate) => isOffering(candidate) && candidate.id === id
    )
    if (!item || !isOffering(item)) return []
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
