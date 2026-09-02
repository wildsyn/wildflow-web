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

import type { Modality, PricingModel, PricingVendor } from '../types'

const CATALOG_MODEL_IDS: Record<WildFlowOffering['id'], number> = {
  VoxCPM2: -10_001,
  'FLUX.2 [klein] 4B': -10_002,
  'wildflow/internal-vibevoice-faster-whisper-asr-v1': -10_003,
}

const RETIRED_ASR_MODEL_IDS = new Set([
  'wildflow/exam-replay-dual-asr-v1',
  'wildflow/dual-asr-v1',
])

const ENTITLEMENT_GATED_MODEL_IDS = new Set<string>([
  'wildflow/internal-vibevoice-faster-whisper-asr-v1',
])

function offeringToPricingModel(offering: WildFlowOffering): PricingModel {
  const isTts = offering.kind === 'tts'
  const isAsr = offering.kind === 'asr'
  let tags = 'first-party,image-generation'
  let inputModalities: Modality[] = ['text', 'image']
  let outputModalities: Modality[] = ['image']
  if (isTts) {
    tags = 'first-party,tts'
    inputModalities = ['text', 'audio']
    outputModalities = ['audio']
  } else if (isAsr) {
    tags = 'first-party,speech-recognition'
    inputModalities = ['audio']
    outputModalities = ['text']
  }

  return {
    id: CATALOG_MODEL_IDS[offering.id],
    model_name: offering.id,
    description: offering.description,
    vendor_name: offering.vendor,
    quota_type: 1,
    model_ratio: 0,
    completion_ratio: 0,
    enable_groups: [],
    tags,
    supported_endpoint_types: offering.callable ? ['wildflow-jobs'] : [],
    input_modalities: inputModalities,
    output_modalities: outputModalities,
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

function enrichPricingModelWithOffering(
  model: PricingModel,
  offering: WildFlowOffering
): PricingModel {
  const catalogModel = offeringToPricingModel(offering)
  return {
    ...model,
    description: model.description ?? catalogModel.description,
    vendor_name: model.vendor_name ?? catalogModel.vendor_name,
    tags: model.tags ?? catalogModel.tags,
    // Pricing is presentation data only. The entitlement catalog alone
    // authorizes which endpoint samples can be offered for this model.
    supported_endpoint_types: catalogModel.supported_endpoint_types,
    input_modalities: model.input_modalities ?? catalogModel.input_modalities,
    output_modalities:
      model.output_modalities ?? catalogModel.output_modalities,
    catalog_callable: catalogModel.catalog_callable,
    catalog_display_name: catalogModel.catalog_display_name,
    catalog_model_version_ref: catalogModel.catalog_model_version_ref,
    catalog_price_amount: catalogModel.catalog_price_amount,
    catalog_price_display: catalogModel.catalog_price_display,
    catalog_required_parameters: catalogModel.catalog_required_parameters,
    catalog_voices: catalogModel.catalog_voices,
  }
}

export function mergeWildFlowCatalogIntoPricing(
  models: PricingModel[],
  offerings: WildFlowOffering[]
): PricingModel[] {
  const offeringById = new Map<string, WildFlowOffering>(
    offerings.map((offering) => [offering.id, offering])
  )
  const activeModels = models.filter((model) => {
    if (RETIRED_ASR_MODEL_IDS.has(model.model_name)) return false
    if (!ENTITLEMENT_GATED_MODEL_IDS.has(model.model_name)) return true
    return offeringById.get(model.model_name)?.callable === true
  })
  const enrichedModels = activeModels.map((model) => {
    const offering = offeringById.get(model.model_name)
    return offering ? enrichPricingModelWithOffering(model, offering) : model
  })
  const configuredNames = new Set(activeModels.map((model) => model.model_name))
  const catalogModels = offerings
    .filter(
      (offering) => offering.callable && !configuredNames.has(offering.id)
    )
    .map(offeringToPricingModel)

  return [...enrichedModels, ...catalogModels]
}

export function mergeWildFlowCatalogVendors(
  vendors: PricingVendor[],
  offerings: WildFlowOffering[]
): PricingVendor[] {
  const vendorNames = new Set(vendors.map((vendor) => vendor.name))
  const catalogVendors = offerings.flatMap((offering, index) => {
    if (!offering.callable) return []
    if (vendorNames.has(offering.vendor)) return []
    vendorNames.add(offering.vendor)
    return [{ id: -20_001 - index, name: offering.vendor }]
  })

  return [...vendors, ...catalogVendors]
}
