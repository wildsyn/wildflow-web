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
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { AuthLayout } from '../auth-layout'
import {
  buildUnifiedEnrollmentPath,
  startUnifiedEnrollment,
} from '../lib/unified-enrollment'

export function SignUp() {
  const { t } = useTranslation()

  useEffect(() => {
    startUnifiedEnrollment({
      search: window.location.search,
      replace: (destination) => window.location.replace(destination),
    })
  }, [])

  const fallbackPath = buildUnifiedEnrollmentPath(
    typeof window === 'undefined' ? '' : window.location.search
  )

  return (
    <AuthLayout>
      <div className='w-full space-y-6 text-center'>
        <Loader2 className='text-primary mx-auto size-8 animate-spin' />
        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold tracking-tight'>
            {t('Redirecting to unified account registration')}
          </h2>
          <p className='text-muted-foreground text-sm sm:text-base'>
            {t(
              'Registration and email verification are handled by WildFlow unified account.'
            )}
          </p>
        </div>
        <a
          href={fallbackPath}
          className='hover:text-primary text-sm font-medium underline underline-offset-4'
        >
          {t('Continue if you are not redirected automatically')}
        </a>
      </div>
    </AuthLayout>
  )
}
