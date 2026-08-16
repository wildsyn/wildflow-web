import { createFileRoute } from '@tanstack/react-router'

import { HarnessOverview } from '@/features/harness'

export const Route = createFileRoute('/harness/')({
  component: HarnessOverview,
})
