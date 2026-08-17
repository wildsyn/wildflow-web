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
import { Info, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  getWildFlowDefaultAnnouncements,
  getWildFlowDefaultFAQ,
} from '@/config/wildflow-public-content'

export function PublicInformation() {
  const { t } = useTranslation()
  const announcement = getWildFlowDefaultAnnouncements(t)[0]
  const faq = getWildFlowDefaultFAQ(t)

  return (
    <section className='relative z-10 px-6 py-20 md:py-24'>
      <div className='mx-auto max-w-6xl'>
        <div className='border-border bg-muted/30 mb-16 flex items-start gap-3 rounded-xl border p-5'>
          <Info
            className='text-primary mt-0.5 size-5 shrink-0'
            aria-hidden='true'
          />
          <div>
            <h2 className='text-sm font-semibold'>{announcement.content}</h2>
            <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
              {announcement.extra}
            </p>
          </div>
        </div>

        <div className='grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]'>
          <div>
            <p className='text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase'>
              {t('FAQ')}
            </p>
            <h2 className='text-2xl leading-tight font-bold tracking-tight md:text-3xl'>
              {t('What to know before you integrate')}
            </h2>
            <p className='text-muted-foreground mt-4 max-w-md text-sm leading-relaxed'>
              {t(
                'Start from the current model catalog and documented interfaces. Capabilities that are still being verified are not presented as ready.'
              )}
            </p>
          </div>

          <div className='border-border divide-border divide-y rounded-xl border px-5'>
            {faq.map((item) => (
              <details key={item.id} className='group py-4'>
                <summary className='flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold'>
                  {item.question}
                  <Plus
                    className='text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-45'
                    aria-hidden='true'
                  />
                </summary>
                <p className='text-muted-foreground pt-3 pr-8 text-sm leading-relaxed'>
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
