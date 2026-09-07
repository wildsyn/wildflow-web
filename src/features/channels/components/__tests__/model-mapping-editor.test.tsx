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
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test } from 'vitest'

import { Button } from '@/components/ui/button'

import { ModelMappingEditor } from '../model-mapping-editor'

function ControlledEditor() {
  const [value, setValue] = useState('')
  return (
    <>
      <ModelMappingEditor value={value} onChange={setValue} />
      <output aria-label='Saved mapping'>{value}</output>
      <Button
        type='button'
        onClick={() => setValue('{"external":"replacement"}')}
      >
        Load another mapping
      </Button>
    </>
  )
}

test('keeps a new row while typing a stable alias and provider model in a controlled form', async () => {
  const user = userEvent.setup()
  render(<ControlledEditor />)
  await user.click(screen.getByRole('button', { name: 'Add Mapping' }))
  await user.type(
    screen.getByPlaceholderText('gpt-3.5-turbo-0125'),
    'gpt-image-2-official'
  )
  await user.type(screen.getByPlaceholderText('gpt-3.5-turbo'), 'studio-image')
  expect(
    JSON.parse(screen.getByLabelText('Saved mapping').textContent || '{}')
  ).toEqual({ 'studio-image': 'gpt-image-2-official' })
  await user.click(screen.getByRole('button', { name: 'Add Mapping' }))
  expect(screen.getAllByPlaceholderText('gpt-3.5-turbo')).toHaveLength(2)
  await user.click(screen.getByRole('button', { name: 'Load another mapping' }))
  expect(screen.getByPlaceholderText('gpt-3.5-turbo')).toHaveValue('external')
  expect(screen.getByPlaceholderText('gpt-3.5-turbo-0125')).toHaveValue(
    'replacement'
  )
})
