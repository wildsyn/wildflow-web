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
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'
import { RichContent } from '@/components/rich-content'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_LOGO } from '@/lib/constants'
import { isHttpUrl, isLikelyHtml } from '@/lib/content-format'

import { getAboutContent } from './api'

const NEW_API_ATTRIBUTION_NOTICE =
  'Frontend design and development by New API contributors.'

function NewApiAttribution() {
  const { t } = useTranslation()

  return (
    <aside
      aria-label='Open-source attribution'
      className='border-border/60 mx-auto my-10 w-full max-w-4xl border-t px-6 pt-8'
    >
      <div className='space-y-3'>
        <h3 className='text-foreground text-lg font-semibold'>
          {t('Upstream project and acknowledgements')}
        </h3>
        <p className='text-muted-foreground text-sm leading-6'>
          {t(
            'WildFlow Web and WildFlow API are developed from a fixed revision of QuantumNous/new-api, with changes for WildFlow branding, product boundaries, frontend/backend separation, public job APIs, and inference integration.'
          )}
        </p>
        <p className='text-muted-foreground text-sm leading-6'>
          {t(
            'WildFlow is an independently maintained derivative project and is not an official New API distribution.'
          )}
        </p>
        <p className='text-muted-foreground text-xs'>
          {NEW_API_ATTRIBUTION_NOTICE}
        </p>
      </div>
      <p className='mt-4 flex flex-wrap items-center gap-2 text-sm'>
        <a
          href='https://github.com/QuantumNous/new-api'
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary font-medium hover:underline'
        >
          {t('View the New API upstream project')}
        </a>
        <span aria-hidden='true'>·</span>
        <a
          href='https://github.com/QuantumNous/new-api/blob/main/LICENSE'
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary font-medium hover:underline'
        >
          GNU AGPL v3.0
        </a>
      </p>
    </aside>
  )
}

function EmptyAboutState() {
  const { t } = useTranslation()

  return (
    <div className='mx-auto w-full max-w-4xl px-6 py-12'>
      <div className='space-y-10'>
        <header className='space-y-4 text-center'>
          <div className='flex justify-center'>
            <img
              src={DEFAULT_LOGO}
              alt={t('WildFlow logo')}
              className='size-20 object-contain'
            />
          </div>
          <div className='space-y-3'>
            <h2 className='text-3xl font-bold'>{t('About WildFlow')}</h2>
            <p className='text-muted-foreground mx-auto max-w-3xl leading-7'>
              {t(
                "WildFlow is WildSyn's AI model and task service platform, providing developers and teams with unified model APIs, durable asynchronous jobs, artifact management, and usage-based billing."
              )}
            </p>
            <p className='text-muted-foreground mx-auto max-w-3xl leading-7'>
              {t(
                'WildFlow connects third-party model services with self-hosted GPU inference resources, so text, image, speech, and other models can be integrated, invoked, and managed consistently. Harness organizes these model capabilities into reusable solutions for specific scenarios.'
              )}
            </p>
          </div>
        </header>

        <section
          aria-labelledby='open-source-projects'
          className='border-border rounded-lg border p-6'
        >
          <h3 id='open-source-projects' className='text-xl font-semibold'>
            {t('Open-source projects')}
          </h3>
          <ul className='mt-5 space-y-4'>
            <li>
              <a
                href='https://github.com/wildsyn/wildflow-web'
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary font-medium hover:underline'
              >
                WildFlow Web
              </a>
              <span className='text-muted-foreground'>
                {' — '}
                {t('Frontend, Model Square, and Console')}
              </span>
            </li>
            <li>
              <a
                href='https://github.com/wildsyn/wildflow-api'
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary font-medium hover:underline'
              >
                WildFlow API
              </a>
              <span className='text-muted-foreground'>
                {' — '}
                {t('Public API and commercial control plane')}
              </span>
            </li>
          </ul>
          <p className='text-muted-foreground mt-5 text-sm leading-6'>
            {t(
              'The open-source scope and terms of use of each repository are governed by its LICENSE, NOTICE, and repository documentation.'
            )}
          </p>
        </section>
      </div>
    </div>
  )
}

export function About() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['about-content'],
    queryFn: getAboutContent,
  })

  const rawContent = data?.data?.trim() ?? ''
  const hasContent = rawContent.length > 0
  const isUrl = hasContent && isHttpUrl(rawContent)
  const contentIsHtml = hasContent && isLikelyHtml(rawContent)

  if (isLoading) {
    return (
      <PublicLayout>
        <div className='mx-auto flex max-w-4xl flex-col gap-4 py-12'>
          <Skeleton className='h-8 w-[45%]' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[90%]' />
          <Skeleton className='h-4 w-[80%]' />
        </div>
      </PublicLayout>
    )
  }

  if (!hasContent) {
    return (
      <PublicLayout>
        <EmptyAboutState />
        <NewApiAttribution />
      </PublicLayout>
    )
  }

  if (isUrl) {
    return (
      <PublicLayout showMainContainer={false}>
        <iframe
          src={rawContent}
          className='h-[calc(100vh-3.5rem)] w-full border-0'
          title={t('About')}
          sandbox='allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts'
        />
        <NewApiAttribution />
      </PublicLayout>
    )
  }

  if (contentIsHtml) {
    return (
      <PublicLayout showMainContainer={false}>
        <RichContent
          mode='html'
          htmlVariant='isolated'
          content={rawContent}
          className='prose-neutral dark:prose-invert max-w-none'
        />
        <NewApiAttribution />
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className='mx-auto max-w-6xl px-4 py-8'>
        <RichContent
          mode='markdown'
          content={rawContent}
          className='prose-neutral dark:prose-invert max-w-none'
        />
        <NewApiAttribution />
      </div>
    </PublicLayout>
  )
}
