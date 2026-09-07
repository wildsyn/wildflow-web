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
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'

import { speechSegments, speechSegmentAudio } from '../api'
import { LiveSpeech } from '../components/live-speech'
vi.mock('../api', () => ({
  speechSegments: vi.fn(),
  speechSegmentAudio: vi.fn(),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
afterEach(() => vi.unstubAllGlobals())
it('plays a durable segment before completion and stops playback on unmount', async () => {
  const start = vi.fn(),
    stop = vi.fn(),
    close = vi.fn().mockResolvedValue(undefined)
  class FakeContext {
    currentTime = 0
    destination = {}
    resume = vi.fn().mockResolvedValue(undefined)
    close = close
    decodeAudioData = vi.fn().mockResolvedValue({ duration: 1 })
    createBufferSource = () => ({
      buffer: null,
      connect: vi.fn(),
      start,
      stop,
      onended: null,
    })
  }
  vi.stubGlobal('AudioContext', FakeContext)
  vi.mocked(speechSegments).mockResolvedValue([
    { segment_id: 'segment-1', attempt_id: 'attempt-1', sequence: 1 },
  ])
  vi.mocked(speechSegmentAudio).mockResolvedValue(new ArrayBuffer(44))
  const view = render(<LiveSpeech job='job-1' done={false} />)
  await userEvent.click(
    screen.getByRole('button', { name: 'Listen while generating' })
  )
  await waitFor(() => expect(start).toHaveBeenCalledTimes(1))
  expect(speechSegmentAudio).toHaveBeenCalledWith('job-1', 'segment-1')
  view.unmount()
  expect(stop).toHaveBeenCalledTimes(1)
  expect(close).toHaveBeenCalledTimes(1)
})
