import { getDictItems } from '@/api/system'
const dict = {
  state: {
    dictList: []
  },
  mutations: {
    SET_DICT_LIST: (state, data) => {
      state.dictList[data.name] = data.list
    }
  },
  actions: {
    loadDict({ commit, state }, name) {
      return new Promise((resolve, reject) => {
        getDictItems(name).then(response => {
          commit('SET_DICT_LIST', { name: name, list: response.data.data })
          resolve(response.data.data)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default dict
