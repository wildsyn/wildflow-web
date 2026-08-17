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
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@/components/dialog'
import { Button } from '@/components/ui/button'

export const COMPLIANCE_NOTICE_STORAGE_KEY =
  'wildflow_compliance_notice_ack_2026-08-17'

const ACKNOWLEDGED_VALUE = 'acknowledged'

const preparationSections = [
  {
    title: 'Filing and qualification requirements',
    description:
      'We are identifying and completing the filings and qualifications required for the website, domains, and actual business.',
  },
  {
    title: 'Content safety review and governance',
    description:
      'We are improving content review, risk identification, reporting, handling, and appeal processes for inputs and generated content.',
  },
  {
    title: 'Identity management and log retention',
    description:
      'We are improving account identity management, access control, abuse response, security auditing, and necessary log retention.',
  },
  {
    title: 'Tax and payment compliance',
    description:
      'We are preparing top-up, payment, reconciliation, invoicing, refund, and related tax processes. These functions are currently available only to designated internal test users.',
  },
  {
    title: 'Consumer protection',
    description:
      'We are completing user agreements, privacy disclosures, pricing information, after-sales support, refund arrangements, and complaint channels.',
  },
  {
    title: 'Upstream authorization and terms compliance',
    description:
      'We are reviewing and following authorization scopes, usage and resale restrictions, content rules, and service terms for models, APIs, and other upstream services.',
  },
] as const

function hasAcknowledgedNotice(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      window.localStorage.getItem(COMPLIANCE_NOTICE_STORAGE_KEY) ===
        ACKNOWLEDGED_VALUE
    )
  } catch {
    return false
  }
}

type ComplianceNoticeGateProps = {
  children: ReactNode
}

export function ComplianceNoticeGate({ children }: ComplianceNoticeGateProps) {
  const { t } = useTranslation()
  const [acknowledged, setAcknowledged] = useState(hasAcknowledgedNotice)

  const acknowledge = () => {
    try {
      window.localStorage.setItem(
        COMPLIANCE_NOTICE_STORAGE_KEY,
        ACKNOWLEDGED_VALUE
      )
    } catch {
      // The notice can still be dismissed for this page view when storage is unavailable.
    }
    setAcknowledged(true)
  }

  return (
    <>
      {children}
      {!acknowledged ? (
        <Dialog
          open
          title={t(
            'WildFlow internal testing and compliance preparation notice'
          )}
          description={t(
            'WildFlow is currently in internal testing and compliance preparation and is not yet formally open to the public.'
          )}
          contentClassName='sm:max-w-3xl'
          descriptionClassName='leading-6'
          bodyClassName='space-y-4'
          showCloseButton={false}
          initialFocus
          footer={
            <Button size='lg' onClick={acknowledge}>
              {t('I understand, continue browsing')}
            </Button>
          }
        >
          <div className='border-border bg-muted/40 rounded-lg border p-4 text-sm leading-6'>
            {t(
              'Website registration is only for WildFlow team members and designated test users to test functionality. Public visitors should not register accounts, top up, make paid calls, or use the platform for production.'
            )}
          </div>

          <ol className='space-y-3'>
            {preparationSections.map((section, index) => (
              <li
                key={section.title}
                className='border-border/70 rounded-lg border px-4 py-3'
              >
                <div className='flex gap-3'>
                  <span
                    aria-hidden='true'
                    className='bg-primary/10 text-primary flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold'
                  >
                    {index + 1}
                  </span>
                  <div className='min-w-0 space-y-1'>
                    <h2 className='font-medium'>{t(section.title)}</h2>
                    <p className='text-muted-foreground text-sm leading-6'>
                      {t(section.description)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <p className='text-muted-foreground text-sm leading-6'>
            {t(
              'WildFlow will publish a separate announcement when the above preparations are complete and the service is ready to open formally. Thank you for your understanding and cooperation.'
            )}
          </p>
        </Dialog>
      ) : null}
    </>
  )
}
