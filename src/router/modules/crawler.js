import Layout from '@/views/layout/Layout'

const crawlerRouter = {
  path: '/crawler',
  component: Layout,
  redirect: '/crawler/crawler-list',
  name: 'crawler',
  meta: {
    title: 'crawler',
    icon: 'bug'
  },
  children: [
    {
      path: 'crawler-list',
      component: () => import('@/views/crawler/crawlerList'),
      name: 'crawlerList',
      meta: { title: 'crawlerList' }
    },
    {
      path: 'global-param',
      component: () => import('@/views/crawler/globalParamList'),
      name: 'globalParam',
      meta: { title: 'globalParam' }
    }
  ]
}
export default crawlerRouter
