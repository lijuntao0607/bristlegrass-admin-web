var store
export function getDictionary(_store, dictName) {
  store = _store

  return new Promise((resolve, reject) => {
    store.getters.getDict(dictName, data => {
      store.state[dictName] = data
      resolve(data)
    })
  })
}
export function getValue(dictName, key) {
  if (!store.state[dictName]) {
    console.error(`不存在字典${dictName}`)
    return ''
  }
  for (let index = 0; index < store.state[dictName].length; index++) {
    const element = store.state[dictName][index]
    if (element.name === key) {
      return element.value
    }
  }
  return key
}
