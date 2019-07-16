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
      path: 'scenic-spot',
      component: () => import('@/views/travel/scenicSpot'),
      name: 'scenicSpot',
      meta: { title: 'scenicSpotList' }
    },
    {
      path: 'route-line',
      component: () => import('@/views/travel/routeLine'),
      name: 'routeLine',
      meta: { title: 'routeLineList' }
    },
    {
      path: 'edit-route-line',
      component: () => import('@/views/travel/editRouteLine'),
      name: 'editRouteLine',
      hidden: true,
      meta: { title: 'editRouteLine' }
    },
    {
      path: 'TestPage',
      component: () => import('@/views/travel/testPage'),
      name: 'testPage',
      meta: { title: '测试' }
    }
  ]
}
export default travelRouter
