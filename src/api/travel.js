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
export function getDstPage(query) {
  const data = {
    name: query.name,
    parentId: query.parentId,
    page: query.page,
    size: query.size
  }
  return request({
    url: '/dst/page',
    method: 'post',
    data
  })
}
export function saveDst(data) {
  return request({
    url: '/dst/save',
    method: 'post',
    data
  })
}
