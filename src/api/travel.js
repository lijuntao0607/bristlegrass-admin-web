import request from '@/utils/request'

export function getDstTree(parentId) {
  // const baseURL = process.env.BASE_API
  const data = {
    parentId: parentId
  }
  return request({
    url: '/dst/tree',
    method: 'get',
    params: data
  })
}
export function getDstPage(parentId) {
  const data = {
    parentId: parentId
  }
  return request({
    url: '/dst/page',
    method: 'post',
    data
  })
}
