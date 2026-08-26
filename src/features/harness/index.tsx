import { Link } from '@tanstack/react-router'

import { PublicLayout } from '@/components/layout'
import { Footer } from '@/components/layout/components/footer'
import { WILDFLOW_PRODUCT, WILDFLOW_ROUTES } from '@/config/wildflow-product'

const capabilities = [
  ['模型', '国内与国际目录分开管理，具体首批清单仍以合规和可用性验收为准。'],
  ['Skill', '把文案、排版、发布、音视频和增强能力沉淀为可复用节点。'],
  ['Harness', '优先兼容 DeepSeek Harness，用组合能力承接真实内容生产任务。'],
] as const

export function HarnessOverview() {
  return (
    <PublicLayout showMainContainer={false}>
      <main className='mx-auto min-h-[calc(100svh-4rem)] w-full max-w-6xl px-6 pt-28 pb-16'>
        <div className='max-w-3xl'>
          <p className='text-primary text-sm font-semibold'>WildFlow 1.0</p>
          <h1 className='mt-3 text-4xl font-semibold tracking-tight sm:text-5xl'>
            万物皆可组合，但先从真实工作开始
          </h1>
          <p className='text-muted-foreground mt-5 text-base leading-7 sm:text-lg'>
            这里是野生流动的 Harness
            生态入口。当前阶段先服务野生智能的内容营销交付， 以 AI
            视频自动化和考公项目验证可复用的 Skill 与场景包。
          </p>
        </div>

        <section
          className='mt-12 grid gap-4 md:grid-cols-3'
          aria-label='产品能力'
        >
          {capabilities.map(([title, description]) => (
            <article
              key={title}
              className='border-border rounded-xl border p-6'
            >
              <h2 className='text-lg font-semibold'>{title}</h2>
              <p className='text-muted-foreground mt-3 text-sm leading-6'>
                {description}
              </p>
            </article>
          ))}
        </section>

        <div className='mt-10 flex flex-wrap gap-3'>
          <Link
            to={WILDFLOW_ROUTES.models}
            className='bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium'
          >
            查看模型服务
          </Link>
          <a
            href='https://github.com/deepseek-ai/deepseek-harness'
            target='_blank'
            rel='noopener noreferrer'
            className='border-border rounded-md border px-4 py-2 text-sm font-medium'
          >
            查看 DeepSeek Harness 上游
          </a>
          <a
            href={WILDFLOW_PRODUCT.docsUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='border-border rounded-md border px-4 py-2 text-sm font-medium'
          >
            阅读规划文档
          </a>
        </div>

        <p className='text-muted-foreground mt-8 text-xs leading-5'>
          当前为兼容与验证入口，不代表首批 Plugin、公开知识库或安装包已经发布。
        </p>
      </main>
      <Footer />
    </PublicLayout>
  )
}
