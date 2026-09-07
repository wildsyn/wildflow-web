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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'

import { api } from '@/lib/api'

import { VoiceStudio } from '../index'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

beforeEach(() => {
  vi.mocked(api.get).mockImplementation(async (url) => {
    if (String(url).includes('voice-preference')) {
      return {
        data: {
          voice_id: 'official-voice-01-v1',
          content_accounts: { Books: 'custom-voice' },
        },
      }
    }
    return {
      data: {
        data: [
          {
            voice_id: 'official-voice-01-v1',
            name: 'Official 01',
            retention_state: 'active',
          },
          {
            voice_id: 'custom-voice',
            name: 'Book account',
            retention_state: 'active',
          },
        ],
        next_cursor: '',
      },
    }
  })
  vi.mocked(api.post).mockResolvedValue({
    data: { id: 'op-1', state: 'succeeded', artifacts: [] },
  })
  vi.mocked(api.put).mockResolvedValue({ data: { voice_id: 'custom-voice' } })
})

it('submits the selected voice explicitly with the script', async () => {
  const user = userEvent.setup()
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <VoiceStudio />
    </QueryClientProvider>
  )
  const voice = await screen.findByRole('combobox', { name: 'Voice' })
  await waitFor(() => expect(voice).toHaveValue('official-voice-01-v1'))
  await user.selectOptions(voice, 'custom-voice')
  await user.type(
    screen.getByRole('textbox', { name: 'Script' }),
    'Hello readers'
  )
  await user.click(screen.getByRole('button', { name: 'Generate speech' }))
  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith(
      '/api/user/self/voice-jobs',
      expect.objectContaining({
        model: 'IndexTTS-2.5',
        parameters: expect.objectContaining({
          voice_id: 'custom-voice',
          text: 'Hello readers',
        }),
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Idempotency-Key': expect.any(String),
        }),
      })
    )
  )
})

it('keeps generation disabled until a voice and script are available', async () => {
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <VoiceStudio />
    </QueryClientProvider>
  )
  expect(screen.getByRole('button', { name: 'Generate speech' })).toBeDisabled()
  await screen.findByRole('option', { name: 'Book account' })
  expect(screen.getByRole('button', { name: 'Generate speech' })).toBeDisabled()
})

it('selects and saves independent content account voices', async () => {
  const user = userEvent.setup()
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <VoiceStudio />
    </QueryClientProvider>
  )
  const voice = await screen.findByRole('combobox', { name: 'Voice' })
  await waitFor(() => expect(voice).toHaveValue('official-voice-01-v1'))
  const account = screen.getByLabelText('Content account (optional)')
  await user.type(account, 'Books')
  await waitFor(() => expect(voice).toHaveValue('custom-voice'))
  await user.selectOptions(voice, 'official-voice-01-v1')
  await user.click(screen.getByRole('button', { name: 'Set as default' }))
  await waitFor(() =>
    expect(api.put).toHaveBeenCalledWith('/api/user/self/voice-preference', {
      voice_id: 'official-voice-01-v1',
      content_account: 'Books',
    })
  )
  await user.clear(account)
  await waitFor(() => expect(voice).toHaveValue('official-voice-01-v1'))
})
