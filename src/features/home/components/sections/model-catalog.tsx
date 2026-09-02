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
import { AudioLines, Captions, ImageIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { WildFlowOffering } from '../../types'

interface ModelCatalogProps {
  offerings: WildFlowOffering[]
  isLoading?: boolean
}

export function ModelCatalog({ offerings, isLoading }: ModelCatalogProps) {
  const { t } = useTranslation()
  let catalogContent

  if (isLoading) {
    catalogContent = (
      <div
        className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'
        aria-label={t('Loading...')}
        aria-busy='true'
      >
        {[
          'VoxCPM2',
          'FLUX.2 [klein] 4B',
          'wildflow/internal-vibevoice-faster-whisper-asr-v1',
        ].map((id) => (
          <div
            key={id}
            className='border-border bg-muted/30 h-64 animate-pulse rounded-xl border'
          />
        ))}
      </div>
    )
  } else if (offerings.length === 0) {
    catalogContent = (
      <div className='border-border text-muted-foreground rounded-xl border px-6 py-10 text-sm'>
        {t('Model catalog is temporarily unavailable')}
      </div>
    )
  } else {
    catalogContent = (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {offerings.map((offering) => {
          const isTTS = offering.kind === 'tts'
          const isASR = offering.kind === 'asr'
          let offeringIcon = <ImageIcon className='size-5' aria-hidden='true' />
          let offeringKind = 'Image Generation'
          if (isTTS) {
            offeringIcon = <AudioLines className='size-5' aria-hidden='true' />
            offeringKind = 'TTS'
          } else if (isASR) {
            offeringIcon = <Captions className='size-5' aria-hidden='true' />
            offeringKind = 'Speech Recognition'
          }
          return (
            <article
              key={offering.id}
              data-model-offering={offering.id}
              className='border-border bg-background flex min-h-64 flex-col rounded-xl border p-6'
            >
              <div className='mb-6 flex items-start justify-between gap-4'>
                <div className='bg-muted flex size-10 items-center justify-center rounded-lg'>
                  {offeringIcon}
                </div>
                <span
                  className={
                    offering.callable
                      ? 'inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400'
                      : 'border-border bg-muted text-muted-foreground inline-flex rounded-full border px-2.5 py-1 text-xs font-medium'
                  }
                >
                  {t(offering.callable ? 'Available' : 'Unavailable')}
                </span>
              </div>

              <p className='text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase'>
                {t(offeringKind)}
              </p>
              <h3 className='mb-2 text-base font-semibold'>
                {offering.display_name}
              </h3>
              <p className='text-muted-foreground mb-6 text-sm leading-relaxed'>
                {offering.description}
              </p>

              {isTTS && offering.voices && offering.voices.length > 0 && (
                <div className='mb-5 flex flex-wrap gap-1.5'>
                  {offering.voices.map((voice) => (
                    <span
                      key={voice.id}
                      className='bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs'
                    >
                      {voice.name}
                    </span>
                  ))}
                </div>
              )}

              <div className='border-border mt-auto border-t pt-4'>
                <div className='flex items-center justify-between gap-3'>
                  <p className='text-muted-foreground text-xs'>
                    {offering.vendor}
                  </p>
                  <p className='text-sm font-semibold'>
                    {offering.pricing.display}
                  </p>
                </div>
                <code className='mt-1 block text-xs break-all'>
                  {offering.model_version_ref}
                </code>
              </div>
            </article>
          )
        })}
      </div>
    )
  }

  return (
    <section id='models' className='relative z-10 px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-12 max-w-2xl'>
          <p className='text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase'>
            {t('First-party models')}
          </p>
          <h2 className='text-2xl leading-tight font-bold tracking-tight md:text-3xl'>
            {t('Voice, image, and speech recognition models')}
          </h2>
        </div>
        {catalogContent}
      </div>
    </section>
  )
}
