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

import { Button } from '@/components/ui/button'

type RegistrationFilingNoticeProps = {
  variant: 'sign-in' | 'sign-up'
}

const filingFacts = [
  'Filing in progress',
  'Company-internal testing only; no social or public beta',
  'Filed models: 0',
] as const

export function RegistrationFilingNotice(props: RegistrationFilingNoticeProps) {
  const { t } = useTranslation()
  const isSignUp = props.variant === 'sign-up'
  const title = isSignUp
    ? t('Registration is not open')
    : t('Internal test access only')
  const description = isSignUp
    ? t('Registration is closed. No new users may register at this stage.')
    : t(
        'Existing company-internal test accounts may sign in only for approved internal testing. Registration is closed.'
      )

  return (
    <section
      aria-labelledby='registration-filing-notice-title'
      className='border-border bg-muted/30 space-y-4 rounded-xl border p-5'
    >
      <div className='space-y-2'>
        <h2
          id='registration-filing-notice-title'
          className='text-xl font-semibold tracking-tight'
        >
          {title}
        </h2>
        <p className='text-muted-foreground text-sm leading-6'>{description}</p>
      </div>

      <ul className='space-y-2 text-sm leading-6'>
        {filingFacts.map((fact) => (
          <li key={fact} className='flex gap-2'>
            <span aria-hidden='true' className='text-primary font-semibold'>
              •
            </span>
            <span>{t(fact)}</span>
          </li>
        ))}
      </ul>

      {isSignUp ? (
        <Button className='w-full' render={<a href='/sign-in' />}>
          {t('Company internal sign in')}
        </Button>
      ) : null}
    </section>
  )
}
