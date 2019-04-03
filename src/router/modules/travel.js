import Layout from '@/views/layout/Layout'

const travelRouter = {
  path: '/travel',
  component: Layout,
  redirect: '/travel/mdd',
  name: 'travel',
  meta: {
    title: 'travel',
    icon: 'international'
  },
  children: [
    {
      path: 'dst',
      component: () => import('@/views/travel/dst'),
      name: 'dst',
      meta: { title: 'dstList' }
    },
    {
      path: 'scenicSpot',
      component: () => import('@/views/travel/scenicSpot'),
      name: 'scenicSpot',
      meta: { title: 'scenicSpotList' }
    }
  ]
}
export default travelRouter
