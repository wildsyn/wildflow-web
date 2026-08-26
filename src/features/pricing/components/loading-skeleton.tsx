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
import { Skeleton } from '@/components/ui/skeleton'

import { VIEW_MODES, type ViewMode } from '../constants'

const CARD_SKELETON_IDS = [
  'featured-model',
  'balanced-model',
  'budget-model',
  'fast-model',
  'vision-model',
  'audio-model',
  'reasoning-model',
  'embedding-model',
  'multimodal-model',
] as const

const FILTER_SKELETONS = [
  { id: 'provider-filter', width: 80 },
  { id: 'capability-filter', width: 90 },
  { id: 'context-filter', width: 75 },
  { id: 'price-filter', width: 85 },
  { id: 'status-filter', width: 70 },
] as const

const TABLE_COLUMN_SKELETONS = [
  { id: 'model-column', width: 200 },
  { id: 'input-price-column', width: 100 },
  { id: 'output-price-column', width: 100 },
  { id: 'context-column', width: 100 },
  { id: 'latency-column', width: 80 },
  { id: 'actions-column', width: 100 },
] as const

const TABLE_ROW_SKELETON_IDS = [
  'model-row-alpha',
  'model-row-bravo',
  'model-row-charlie',
  'model-row-delta',
  'model-row-echo',
  'model-row-foxtrot',
  'model-row-golf',
  'model-row-hotel',
  'model-row-india',
  'model-row-juliet',
] as const

const PAGINATION_SKELETON_IDS = [
  'previous-page',
  'first-page',
  'current-page',
  'next-page',
] as const

export interface LoadingSkeletonProps {
  viewMode?: ViewMode
}

export function LoadingSkeleton(props: LoadingSkeletonProps) {
  const viewMode = props.viewMode ?? VIEW_MODES.CARD

  return (
    <div className='space-y-5'>
      <div className='space-y-1.5'>
        <Skeleton className='h-8 w-40' />
        <Skeleton className='h-4 w-52' />
      </div>
      <Skeleton className='h-10 w-full rounded-lg' />
      <FilterBarSkeleton />
      {viewMode === VIEW_MODES.TABLE ? (
        <TableContentSkeleton />
      ) : (
        <CardContentSkeleton />
      )}
    </div>
  )
}

function CardContentSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {CARD_SKELETON_IDS.map((skeletonId) => (
        <div key={skeletonId} className='rounded-xl border p-5'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex min-w-0 items-start gap-3'>
              <Skeleton className='size-10 shrink-0 rounded-xl' />
              <div className='min-w-0 flex-1 space-y-2'>
                <Skeleton className='h-5 w-36' />
                <Skeleton className='h-3.5 w-48' />
              </div>
            </div>
            <Skeleton className='h-8 w-16 rounded-md' />
          </div>
          <div className='mt-4 space-y-2'>
            <Skeleton className='h-3.5 w-full' />
            <Skeleton className='h-3.5 w-4/5' />
          </div>
          <div className='mt-4 flex items-center gap-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-16' />
          </div>
          <div className='mt-2 flex items-center gap-3'>
            <Skeleton className='h-3.5 w-14' />
            <Skeleton className='h-3.5 w-14' />
            <Skeleton className='h-3.5 w-8' />
          </div>
        </div>
      ))}
    </div>
  )
}

function FilterBarSkeleton() {
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-3'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          {FILTER_SKELETONS.map((filter) => (
            <Skeleton
              key={filter.id}
              className='h-8 rounded-lg'
              style={{ width: `${filter.width}px` }}
            />
          ))}
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-24 rounded-lg' />
          <Skeleton className='h-8 w-20 rounded-lg' />
          <Skeleton className='h-8 w-24' />
          <Skeleton className='h-8 w-20 rounded-lg' />
        </div>
      </div>
      <Skeleton className='h-5 w-24' />
    </div>
  )
}

function TableContentSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='overflow-hidden rounded-lg border'>
        <div className='bg-muted/30 border-b px-4 py-3'>
          <div className='flex items-center gap-4'>
            {TABLE_COLUMN_SKELETONS.map((column) => (
              <Skeleton
                key={column.id}
                className='h-4'
                style={{ width: `${column.width}px` }}
              />
            ))}
          </div>
        </div>
        {TABLE_ROW_SKELETON_IDS.map((rowId) => (
          <div
            key={rowId}
            className='flex items-center gap-4 border-b px-4 py-3 last:border-b-0'
          >
            {TABLE_COLUMN_SKELETONS.map((column) => (
              <Skeleton
                key={`${rowId}-${column.id}`}
                className='h-5'
                style={{ width: `${column.width}px` }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-5 w-32' />
        <div className='flex items-center gap-2'>
          {PAGINATION_SKELETON_IDS.map((skeletonId) => (
            <Skeleton key={skeletonId} className='size-8' />
          ))}
        </div>
      </div>
    </div>
  )
}
