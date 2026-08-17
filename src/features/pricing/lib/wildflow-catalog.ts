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
import type { WildFlowOffering } from '@/features/home/types'

import type { PricingModel, PricingVendor } from '../types'

const CATALOG_MODEL_IDS: Record<WildFlowOffering['id'], number> = {
  VoxCPM2: -10_001,
  'FLUX.2 [klein] 4B': -10_002,
}

function offeringToPricingModel(offering: WildFlowOffering): PricingModel {
  const isTts = offering.kind === 'tts'

  return {
    id: CATALOG_MODEL_IDS[offering.id],
    model_name: offering.id,
    description: offering.description,
    vendor_name: offering.vendor,
    quota_type: 1,
    model_ratio: 0,
    completion_ratio: 0,
    enable_groups: [],
    tags: isTts ? 'first-party,tts' : 'first-party,image-generation',
    supported_endpoint_types: ['wildflow_jobs'],
    input_modalities: isTts ? ['text', 'audio'] : ['text', 'image'],
    output_modalities: isTts ? ['audio'] : ['image'],
    pricing_status: 'catalog',
    catalog_callable: offering.callable,
    catalog_display_name: offering.display_name,
    catalog_model_version_ref: offering.model_version_ref,
    catalog_price_amount: offering.pricing.amount,
    catalog_price_display: offering.pricing.display,
    catalog_required_parameters: offering.required_parameters ?? [],
    catalog_voices: (offering.voices ?? []).map((voice) => ({
      id: voice.id,
      name: voice.name,
    })),
  }
}

export function mergeWildFlowCatalogIntoPricing(
  models: PricingModel[],
  offerings: WildFlowOffering[]
): PricingModel[] {
  const configuredNames = new Set(models.map((model) => model.model_name))
  const catalogModels = offerings
    .filter((offering) => !configuredNames.has(offering.id))
    .map(offeringToPricingModel)

  return [...models, ...catalogModels]
}

export function mergeWildFlowCatalogVendors(
  vendors: PricingVendor[],
  offerings: WildFlowOffering[]
): PricingVendor[] {
  const vendorNames = new Set(vendors.map((vendor) => vendor.name))
  const catalogVendors = offerings.flatMap((offering, index) => {
    if (vendorNames.has(offering.vendor)) return []
    vendorNames.add(offering.vendor)
    return [{ id: -20_001 - index, name: offering.vendor }]
  })

  return [...vendors, ...catalogVendors]
}
