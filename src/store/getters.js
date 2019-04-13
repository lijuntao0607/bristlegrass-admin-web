import store from '@/store/index'
const getters = {
  sidebar: state => state.app.sidebar,
  language: state => state.app.language,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  introduction: state => state.user.introduction,
  status: state => state.user.status,
  roles: state => state.user.roles,
  setting: state => state.user.setting,
  permission_routers: state => state.permission.routers,
  addRouters: state => state.permission.addRouters,
  errorLogs: state => state.errorLog.logs,
  getDict: state => (name, callback) => {
    if (!state.dict.dictList[name]) {
      store.dispatch('loadDict', name).then((data) => {
        callback(data)
      }).catch(errMsg => {
        this.$message.error(errMsg)
      })
    } else {
      callback(state.dict.dictList[name])
    }
    return state.dict.dictList[name]
  }
}
export default getters
