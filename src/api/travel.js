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
  return request({
    url: '/dst/page',
    method: 'post',
    data: query
  })
}
export function saveDst(data) {
  return request({
    url: '/dst/save',
    method: 'post',
    data
  })
}
export function getDst(id) {
  return request({
    url: `/dst/${id}/detail`,
    method: 'get'
  })
}
export function deleteDst(id) {
  return request({
    url: `/dst/${id}/delete`,
    method: 'delete'
  })
}
export function getScenicSpotPage(query) {
  return request({
    url: '/scenic-spot/page',
    method: 'post',
    data: query
  })
}
export function saveScenicSpot(data) {
  return request({
    url: '/scenic-spot/save',
    method: 'post',
    data
  })
}
export function changeScenicSpotDst(data) {
  return request({
    url: '/scenic-spot/change-dst',
    method: 'post',
    data
  })
}
export function getScenicSpot(id) {
  return request({
    url: `/scenic-spot/${id}/detail`,
    method: 'get'
  })
}
export function deleteScenicSpot(id) {
  return request({
    url: `/scenic-spot/${id}/delete`,
    method: 'delete'
  })
}
export function getAncestor(id) {
  return request({
    url: `/dst/${id}/ancestor/list`,
    method: 'get'
  })
}
/**
 * 路线
 */
export function getRouteLinePage(query) {
  return request({
    url: '/route-line/page',
    method: 'post',
    data: query
  })
}
export function getRouteLine(id) {
  return request({
    url: `/route-line/${id}/detail`,
    method: 'get'
  })
}
export function saveRouteLine(data) {
  return request({
    url: '/route-line/save',
    method: 'post',
    data
  })
}
export function deleteRouteLine(id) {
  return request({
    url: `/route-line/${id}/delete`,
    method: 'delete'
  })
}
export function refreshRouteLine() {
  return request({
    url: `/route-line/data/refresh`,
    method: 'post'
  })
}
