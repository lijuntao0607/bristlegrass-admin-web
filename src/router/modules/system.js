import Layout from '@/views/layout/Layout'

const systemRouter = {
  path: '/system',
  component: Layout,
  redirect: '/system/dict',
  name: 'system',
  meta: {
    title: 'system',
    icon: 'setting-fill'
  },
  children: [
    {
      path: 'dict',
      component: () => import('@/views/system/dict'),
      name: 'dict',
      meta: { title: 'dict' }
    },
    {
      path: 'dict1',
      component: () => import('@/views/system/dict'),
      name: 'dict1',
      meta: { title: 'dict' }
    }
  ]
}
export default systemRouter
