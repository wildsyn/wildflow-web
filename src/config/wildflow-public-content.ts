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
import type { AnnouncementItem, FAQItem } from '@/features/dashboard/types'

type Translate = (key: string) => string

export function getWildFlowDefaultAnnouncements(
  t: Translate
): AnnouncementItem[] {
  return [
    {
      id: -1,
      type: 'ongoing',
      content: t('Domestic site progress update'),
      extra: t(
        'The new domestic site is consolidating the model catalog, documentation, and console. Model names, supported interfaces, and call status are published only after verification in the Model Square and documentation.'
      ),
    },
  ]
}

export function getWildFlowDefaultFAQ(t: Translate): FAQItem[] {
  return [
    {
      id: -1,
      question: t('Who is WildFlow for?'),
      answer: t(
        'WildFlow is for developers and small teams that want to connect suitable small and medium AI models to products and workflows without rebuilding the deployment and API layer from scratch.'
      ),
    },
    {
      id: -2,
      question: t('Which models can I use now?'),
      answer: t(
        'Use the Model Square and console as the source of truth. The first lineup is being added across text, speech, and image, and the home page does not imply that every category is already callable.'
      ),
    },
    {
      id: -3,
      question: t('How do I confirm a model is ready to integrate?'),
      answer: t(
        'Check the Model Square and documentation for the model name, supported interface, and call status. If the information has not been published there, treat the model as not yet confirmed for integration.'
      ),
    },
    {
      id: -4,
      question: t('Can WildFlow help with self-deployment?'),
      answer: t(
        'Deployment evaluation and API adaptation can be discussed for suitable models. The exact scope depends on the model license, hardware, and integration requirements.'
      ),
    },
  ]
}

export function resolveWildFlowPublicContent<T>(
  enabled: boolean,
  configured: T[] | undefined,
  fallback: T[]
): T[] {
  if (!enabled) return []
  if (configured && configured.length > 0) return configured
  return fallback
}
