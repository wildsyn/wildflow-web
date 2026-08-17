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
import { Boxes, CloudCog, FileCheck2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function ModelCatalog() {
  const { t } = useTranslation()
  const capabilities = [
    {
      id: 'model-api',
      icon: Boxes,
      title: t('Selected model APIs'),
      description: t(
        'A focused catalog for developers and small teams, covering text, speech, and image as each model is ready.'
      ),
      tags: [t('Text'), t('Speech'), t('Image')],
    },
    {
      id: 'deployment',
      icon: CloudCog,
      title: t('Deployment and adaptation'),
      description: t(
        'Support for suitable small and medium models, from deployment evaluation to API adaptation.'
      ),
      tags: [],
    },
    {
      id: 'access-boundaries',
      icon: FileCheck2,
      title: t('Clear access boundaries'),
      description: t(
        'Check supported endpoints, call status, and usage guidance in the Model Square and documentation before integration.'
      ),
      tags: [],
    },
  ]

  return (
    <section id='models' className='relative z-10 px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-12 max-w-2xl'>
          <p className='text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase'>
            {t('Model services')}
          </p>
          <h2 className='text-2xl leading-tight font-bold tracking-tight md:text-3xl'>
            {t('Focused model access for practical products')}
          </h2>
          <p className='text-muted-foreground mt-4 text-sm leading-relaxed'>
            {t(
              'The first model lineup is being connected across text, speech, and image. Model names and call availability are published in the Model Square.'
            )}
          </p>
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
          {capabilities.map((capability) => {
            const Icon = capability.icon
            return (
              <article
                key={capability.id}
                data-model-capability={capability.id}
                className='border-border bg-background flex min-h-60 flex-col rounded-xl border p-6'
              >
                <div className='bg-muted mb-6 flex size-10 items-center justify-center rounded-lg'>
                  <Icon className='size-5' aria-hidden='true' />
                </div>
                <h3 className='mb-2 text-base font-semibold'>
                  {capability.title}
                </h3>
                <p className='text-muted-foreground text-sm leading-relaxed'>
                  {capability.description}
                </p>
                {capability.tags.length > 0 ? (
                  <div className='mt-auto flex flex-wrap gap-2 pt-6'>
                    {capability.tags.map((tag) => (
                      <span
                        key={tag}
                        className='border-border bg-muted text-muted-foreground rounded-full border px-2.5 py-1 text-xs'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
