import request from '@/utils/request'

export function getDstTree(parentId) {
  // const baseURL = process.env.BASE_API
  const data = {
    parentId: parentId
  }
  return request({
    url: '/dst/tree',
    method: 'post',
    data
  })
}
