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
import { describe, test } from 'bun:test'
import assert from 'node:assert/strict'

import type { WildFlowOffering } from '@/features/home/types'

import type { PricingModel } from '../../types'
import { mergeWildFlowCatalogIntoPricing } from '../wildflow-catalog'

const pricedModel: PricingModel = {
  id: 101,
  model_name: 'priced-model',
  quota_type: 1,
  model_ratio: 0,
  completion_ratio: 0,
  model_price: 2,
  enable_groups: ['default'],
}

const offerings: WildFlowOffering[] = [
  {
    id: 'VoxCPM2',
    display_name: 'VoxCPM2',
    kind: 'tts',
    vendor: 'OpenBMB',
    model_version_ref: 'openbmb/VoxCPM2',
    description: 'General-purpose voice design and voice cloning.',
    required_parameters: ['voice'],
    voices: [
      { id: 'shuoshuren', name: '说书人', category: 'official' },
      { id: 'dabin', name: '大斌', category: 'official' },
      { id: 'tingting', name: '婷婷', category: 'official' },
      { id: 'default', name: '默认', category: 'official' },
      { id: 'wangliqun', name: '王立群', category: 'custom' },
    ],
    pricing: {
      currency: 'CNY',
      amount: 0.8,
      unit: '10k_characters',
      display: '¥0.8 / 万字符',
    },
    callable: true,
    status: 'available',
  },
  {
    id: 'FLUX.2 [klein] 4B',
    display_name: 'FLUX.2 [klein] 4B Image Generation',
    kind: 'image',
    vendor: 'Black Forest Labs',
    model_version_ref: 'black-forest-labs/FLUX.2-klein-4B',
    description: 'Image generation.',
    required_parameters: [],
    voices: [],
    pricing: {
      currency: 'CNY',
      amount: 0.05,
      unit: 'image',
      display: '¥0.05 / 张',
    },
    callable: false,
    status: 'unavailable',
  },
  {
    id: 'wildflow/dual-asr-v1',
    display_name: '双引擎语音识别',
    kind: 'asr',
    vendor: 'WildFlow',
    model_version_ref: 'wildflow/exam-replay-dual-asr-v1',
    description: 'Segment transcript and word timestamps.',
    required_parameters: ['input_artifact_ids'],
    pricing: {
      currency: 'CNY',
      amount: 0.1,
      unit: 'audio_minute',
      display: '¥0.10 / 音频分钟',
    },
    callable: true,
    status: 'available',
  },
]

describe('WildFlow catalog in the model square', () => {
  test('adds only callable first-party models', () => {
    const models = mergeWildFlowCatalogIntoPricing([pricedModel], offerings)

    assert.deepEqual(
      models.map((model) => model.model_name),
      ['priced-model', 'VoxCPM2', 'wildflow/dual-asr-v1']
    )

    const catalogModels = models.filter(
      (model) => model.pricing_status === 'catalog'
    )
    assert.equal(catalogModels.length, 2)
    assert.equal(
      catalogModels.every((model) => model.model_price === undefined),
      true
    )
    assert.deepEqual(
      catalogModels.map((model) => model.catalog_price_display),
      ['¥0.8 / 万字符', '¥0.10 / 音频分钟']
    )
    assert.deepEqual(
      catalogModels[0].catalog_voices?.map((voice) => voice.id),
      ['shuoshuren', 'dabin', 'tingting', 'default', 'wangliqun']
    )
    assert.deepEqual(
      catalogModels.find((model) => model.model_name === 'wildflow/dual-asr-v1')
        ?.input_modalities,
      ['audio']
    )
    assert.deepEqual(
      catalogModels.find((model) => model.model_name === 'wildflow/dual-asr-v1')
        ?.supported_endpoint_types,
      ['wildflow-jobs']
    )
  })

  test('does not duplicate a catalog model after backend pricing is configured', () => {
    const configuredTts: PricingModel = {
      ...pricedModel,
      id: 102,
      model_name: 'VoxCPM2',
      model_price: 0.8,
    }

    const models = mergeWildFlowCatalogIntoPricing([configuredTts], offerings)

    assert.equal(
      models.filter((model) => model.model_name === 'VoxCPM2').length,
      1
    )
    assert.equal(models[0].model_price, 0.8)
    assert.equal(models[0].pricing_status, undefined)
  })

  test('does not surface retired ASR models from stale pricing data', () => {
    const models = mergeWildFlowCatalogIntoPricing(
      [
        {
          ...pricedModel,
          model_name: 'wildflow/exam-replay-dual-asr-v1',
        },
      ],
      []
    )

    assert.deepEqual(models, [])
  })

  test('does not let public pricing inject ASR without Runtime availability', () => {
    const models = mergeWildFlowCatalogIntoPricing(
      [
        pricedModel,
        {
          ...pricedModel,
          id: 103,
          model_name: 'wildflow/dual-asr-v1',
          supported_endpoint_types: ['wildflow-jobs'],
        },
      ],
      []
    )

    assert.deepEqual(models, [pricedModel])
  })

  test('does not let a stale cache retain ASR after Runtime becomes unavailable', () => {
    const models = mergeWildFlowCatalogIntoPricing(
      [
        {
          ...pricedModel,
          model_name: 'wildflow/dual-asr-v1',
          supported_endpoint_types: ['wildflow-jobs'],
        },
      ],
      [{ ...offerings[2], callable: false, status: 'unavailable' }]
    )

    assert.deepEqual(models, [])
  })

  test('does not create a catalog model for an unavailable offering', () => {
    const models = mergeWildFlowCatalogIntoPricing(
      [],
      [{ ...offerings[2], callable: false, status: 'unavailable' }]
    )

    assert.deepEqual(models, [])
  })

  test('keeps backend pricing while enriching a same-name model with catalog metadata', () => {
    const configuredTts: PricingModel = {
      ...pricedModel,
      id: 102,
      model_name: 'VoxCPM2',
      model_price: 0.8,
    }

    const [model] = mergeWildFlowCatalogIntoPricing([configuredTts], offerings)

    assert.deepEqual(
      {
        id: model.id,
        model_price: model.model_price,
        pricing_status: model.pricing_status,
        catalog_callable: model.catalog_callable,
        catalog_display_name: model.catalog_display_name,
        catalog_model_version_ref: model.catalog_model_version_ref,
        catalog_price_amount: model.catalog_price_amount,
        catalog_price_display: model.catalog_price_display,
        catalog_required_parameters: model.catalog_required_parameters,
        catalog_voices: model.catalog_voices,
      },
      {
        id: 102,
        model_price: 0.8,
        pricing_status: undefined,
        catalog_callable: true,
        catalog_display_name: 'VoxCPM2',
        catalog_model_version_ref: 'openbmb/VoxCPM2',
        catalog_price_amount: 0.8,
        catalog_price_display: '¥0.8 / 万字符',
        catalog_required_parameters: ['voice'],
        catalog_voices: [
          { id: 'shuoshuren', name: '说书人' },
          { id: 'dabin', name: '大斌' },
          { id: 'tingting', name: '婷婷' },
          { id: 'default', name: '默认' },
          { id: 'wangliqun', name: '王立群' },
        ],
      }
    )
  })

  test('uses the authorized catalog endpoint instead of pricing endpoint data', () => {
    const [model] = mergeWildFlowCatalogIntoPricing(
      [
        {
          ...pricedModel,
          model_name: 'wildflow/dual-asr-v1',
          supported_endpoint_types: ['chat-completions'],
        },
      ],
      [offerings[2]]
    )

    assert.deepEqual(model.supported_endpoint_types, ['wildflow-jobs'])
  })
})
