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
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { logout } from '@/features/auth/api'
import { redirectToCentralSignOut } from '@/features/auth/lib/central-sign-out'
import { clearAuthenticatedClientState } from '@/lib/auth-session'

interface SignOutDialogRuntime {
  logout: typeof logout
  clearAuthenticatedClientState: typeof clearAuthenticatedClientState
  redirectToCentralSignOut: typeof redirectToCentralSignOut
}

const defaultSignOutDialogRuntime: SignOutDialogRuntime = {
  logout,
  clearAuthenticatedClientState,
  redirectToCentralSignOut,
}

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  runtime?: SignOutDialogRuntime
}

export function SignOutDialog(props: SignOutDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const runtime = props.runtime ?? defaultSignOutDialogRuntime
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const response = await runtime.logout()
      if (!response.success) {
        toast.error(response.message || t('Failed to sign out session'))
        return
      }

      runtime.clearAuthenticatedClientState(queryClient)
      toast.success(t('Signed out'))
      runtime.redirectToCentralSignOut(window.location)
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t('Failed to sign out session')
      )
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <ConfirmDialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={t('Sign out')}
      desc={t(
        'Are you sure you want to sign out? You will need to sign in again to access your account.'
      )}
      confirmText={t('Sign out')}
      handleConfirm={handleSignOut}
      isLoading={isSigningOut}
      className='sm:max-w-sm'
    />
  )
}
