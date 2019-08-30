import request from '@/utils/request'
export function getDictPage(query) {
  return request({
    url: '/dict/page',
    method: 'post',
    data: query
  })
}
export function getDictItems(name) {
  return request({
    url: `/dict/${name}/items`,
    method: 'get'
  })
}
export function addDict(data) {
  return request({
    url: '/dict/add',
    method: 'post',
    data
  })
}
export function editDictItem(data) {
  return request({
    url: '/dict/item/modify',
    method: 'put',
    data
  })
}
export function editDict(data) {
  return request({
    url: '/dict/modify',
    method: 'put',
    data
  })
}
export function saveDict(data) {
  return request({
    url: '/dict/save',
    method: 'post',
    data
  })
}
export function deleteDict(id) {
  return request({
    url: `/dst/${id}/delete`,
    method: 'delete'
  })
}
export function getOssSignature(bucket) {
  return request({
    url: `/oss/${bucket}/signature`,
    method: 'get'
  })
}
export function getFeedbackPage(data) {
  return request({
    url: `/feedback/page`,
    method: 'post',
    data
  })
}
