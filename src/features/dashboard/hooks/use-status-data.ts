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
import { useTranslation } from 'react-i18next'

import {
  getWildFlowDefaultAnnouncements,
  getWildFlowDefaultFAQ,
  resolveWildFlowPublicContent,
} from '@/config/wildflow-public-content'
import { useStatus } from '@/hooks/use-status'

import type { AnnouncementItem, ApiInfoItem, FAQItem } from '../types'

/**
 * Get specific list from status data
 */
export function useStatusData<T = unknown>(
  enabledKey: string,
  dataKey: string
): { items: T[]; loading: boolean; enabled: boolean } {
  const { status, loading } = useStatus()
  const enabled = status ? status[enabledKey] !== false : false
  const items = (enabled ? status?.[dataKey] || [] : []) as T[]

  return { items, loading, enabled }
}

/**
 * Get API info list
 */
export function useApiInfo() {
  return useStatusData<ApiInfoItem>('api_info_enabled', 'api_info')
}

/**
 * Get announcements list
 */
export function useAnnouncements() {
  const { t } = useTranslation()
  const content = useStatusData<AnnouncementItem>(
    'announcements_enabled',
    'announcements'
  )
  return {
    ...content,
    items: resolveWildFlowPublicContent(
      content.enabled,
      content.items,
      getWildFlowDefaultAnnouncements(t)
    ),
  }
}

/**
 * Get FAQ list
 */
export function useFAQ() {
  const { t } = useTranslation()
  const content = useStatusData<FAQItem>('faq_enabled', 'faq')
  return {
    ...content,
    items: resolveWildFlowPublicContent(
      content.enabled,
      content.items,
      getWildFlowDefaultFAQ(t)
    ),
  }
}

/**
 * Get dashboard content panel visibility
 */
export function useDashboardContentVisibility() {
  const { status } = useStatus()
  const hasStatus = Boolean(status)

  return {
    apiInfo: hasStatus && status?.api_info_enabled !== false,
    announcements: hasStatus && status?.announcements_enabled !== false,
    faq: hasStatus && status?.faq_enabled !== false,
    uptimeKuma: hasStatus && status?.uptime_kuma_enabled !== false,
  }
}
