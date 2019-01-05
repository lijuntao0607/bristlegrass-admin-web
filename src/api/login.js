import request from '@/utils/request'

export function loginByUsername(username, password) {
  const data = {
    loginName: username,
    password: password
  }
  // const baseURL = process.env.BASE_API
  return request({
    url: '/user/sign-in',
    method: 'post',
    headers: {
      'DEVICE-ID': 'firefox',
      'DEVICE-TYPE': 'web',
      'OS': 'win',
      'OS-VERSION': '1'
    },
    data
  })
}

export function logout() {
  return request({
    url: '/user/sign-out',
    method: 'post'
  })
}

export function getUserInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

