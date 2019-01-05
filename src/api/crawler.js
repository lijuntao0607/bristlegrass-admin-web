import request from '@/utils/request'

export function loadCrawlerList() {
  // const baseURL = process.env.BASE_API
  return request({
    url: '/crawler/list',
    method: 'get'
  })
}
export function startJob(crawlerName) {
  return request({
    url: `/crawler/${crawlerName}/start`,
    method: 'post'
  })
}
export function stopJob(crawlerName) {
  return request({
    url: `/crawler/${crawlerName}/stop`,
    method: 'post'
  })
}
export function updateCrawlerParam(data) {
  return request({
    url: '/crawler/param/edit',
    method: 'post',
    data
  })
}
export function deleteCrawlerParam(id) {
  return request({
    url: `/crawler/param/${id}/delete`,
    method: 'delete'
  })
}
export function loadGlobalParam(data) {
  return request({
    url: '/crawler/param/globals',
    method: 'get',
    params: data
  })
}
export function loadCrawlerParam(crawlerName) {
  return request({
    url: `/crawler/${crawlerName}/params`,
    method: 'get'
  })
}

export function addGlobalParam(data) {
  return request({
    url: '/crawler/param/global/add',
    method: 'post',
    data
  })
}
export function addCrawlerParam(crawlerName, data) {
  return request({
    url: `/crawler/${crawlerName}/param/add`,
    method: 'post',
    data
  })
}
export function editParam(data) {
  return request({
    url: '/crawler/param/edit',
    method: 'post',
    data
  })
}
export function deleteParam(id) {
  return request({
    url: `/crawler/param/${id}/delete`,
    method: 'delete'
  })
}
// crawlerJob
export function loadCrawlerJobList(data) {
  return request({
    url: '/crawler/param/globals',
    method: 'get',
    params: data
  })
}
export function loadCrawlerJob(data) {
  return request({
    url: `/crawler/job/page`,
    method: 'post'
  })
}
export function loadCrawlerJobItem(jobId, data) {
  return request({
    url: `/crawler/job/${jobId}item/find`,
    method: 'get'
  })
}
