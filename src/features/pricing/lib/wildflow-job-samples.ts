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
export type WildFlowJobSampleLanguage =
  | 'curl'
  | 'python'
  | 'typescript'
  | 'javascript'

export interface WildFlowJobSampleContext {
  apiKeyEnv: string
  modelName: string
}

function buildParameters(modelName: string): Record<string, unknown> {
  if (modelName === 'VoxCPM2') {
    return { input: '要合成的文本', voice: 'default' }
  }
  if (modelName === 'FLUX.2 [klein] 4B') {
    return { prompt: '一只在草地上奔跑的小狗', width: 1024, height: 1024 }
  }
  return { language: 'zh', context: '直播回放' }
}

export function buildWildFlowJobSample(
  language: WildFlowJobSampleLanguage,
  context: WildFlowJobSampleContext
): string {
  const url = 'https://api.wildflow.cn/v1/jobs'
  const body: Record<string, unknown> = {
    model: context.modelName,
    parameters: buildParameters(context.modelName),
  }
  if (context.modelName === 'wildflow/exam-replay-dual-asr-v1') {
    body.input_artifact_ids = ['替换为已上传的输入 Artifact ID']
  }
  const bodyJson = JSON.stringify(body, null, 2)

  if (language === 'curl') {
    return [
      `curl --fail-with-body --silent --show-error \\`,
      `  -X POST ${url} \\`,
      `  -H "Authorization: Bearer $${context.apiKeyEnv}" \\`,
      `  -H "Idempotency-Key: $(uuidgen)" \\`,
      `  -H "Content-Type: application/json" \\`,
      `  --data-binary '${bodyJson.replaceAll('\n', '\n     ')}'`,
    ].join('\n')
  }

  if (language === 'python') {
    return [
      'import os, uuid, requests',
      '',
      `response = requests.post(${JSON.stringify(url)},`,
      `    headers={"Authorization": "Bearer " + os.environ[${JSON.stringify(context.apiKeyEnv)}],`,
      '             "Idempotency-Key": str(uuid.uuid4())},',
      `    json=${bodyJson.replaceAll('\n', '\n    ')})`,
      'response.raise_for_status()',
      'print(response.json())',
    ].join('\n')
  }

  return [
    `const response = await fetch(${JSON.stringify(url)}, {`,
    `  method: 'POST',`,
    `  headers: {`,
    `    Authorization: \`Bearer \${process.env.${context.apiKeyEnv}}\`,`,
    `    'Idempotency-Key': crypto.randomUUID(),`,
    `    'Content-Type': 'application/json',`,
    `  },`,
    `  body: JSON.stringify(${bodyJson.replaceAll('\n', '\n  ')}),`,
    `})`,
    `if (!response.ok) throw new Error(await response.text())`,
    `console.log(await response.json())`,
  ].join('\n')
}
