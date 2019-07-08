import { onSnapshot, applySnapshot } from 'mobx-state-tree'

import AsyncLocalStorage from './asyncLocalStorage'

export interface IArgs {
  (name: string, store: object, options?: IOptions): Promise<void>
}
export interface IOptions {
  storage?: any,
  jsonify?: boolean,
  readonly whitelist?: Array<string>,
  readonly blacklist?: Array<string>
}

export const persist: IArgs = (name, store, options = {}) => {
  let {storage, jsonify, whitelist, blacklist} = options

  if (typeof window.localStorage !== 'undefined' && (!storage || storage === window.localStorage)) {
    storage = AsyncLocalStorage
  }
  if (!jsonify) { jsonify = true } // default to true like mobx-persist
  const whitelistDict = arrToDict(whitelist)
  const blacklistDict = arrToDict(blacklist)

  onSnapshot(store, (_snapshot) => {
    const snapshot = { ..._snapshot }
    Object.keys(snapshot).forEach((key) => {
      if (whitelist && !whitelistDict[key]) {
        delete snapshot[key]
      }
      if (blacklist && blacklistDict[key]) {
        delete snapshot[key]
      }
    })

    const data = !jsonify ? snapshot : JSON.stringify(snapshot)
    storage.setItem(name, data)
  })

  return storage.getItem(name)
    .then((data: any) => {
      const snapshot = !jsonify ? data : JSON.parse(data)
      // don't apply falsey (which will error), leave store in initial state
      if (!snapshot) { return }
      applySnapshot(store, snapshot)
    })
}

function arrToDict (arr?: Array<string>): object {
  if (!arr) { return {} }
  return arr.reduce((dict, elem) => {
    dict[elem] = true
    return dict
  }, {})
}

export default persist
