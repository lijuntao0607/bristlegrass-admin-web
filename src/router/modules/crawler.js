import Layout from '@/views/layout/Layout'

const crawlerRouter = {
  path: '/crawler',
  component: Layout,
  redirect: '/crawler/crawlerList',
  name: 'crawler',
  meta: {
    title: 'crawler',
    icon: 'bug'
  },
  children: [
    {
      path: 'crawlerList',
      component: () => import('@/views/crawler/crawlerList'),
      name: 'crawlerList',
      meta: { title: 'crawlerList' }
    },
    {
      path: 'globalParam',
      component: () => import('@/views/crawler/globalParamList'),
      name: 'globalParam',
      meta: { title: 'globalParam' }
    }
  ]
}
export default crawlerRouter
