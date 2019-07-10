import { onSnapshot, applySnapshot, IStateTreeNode } from 'mobx-state-tree'

import AsyncLocalStorage from './asyncLocalStorage'

export interface IArgs {
  (name: string, store: IStateTreeNode, options?: IOptions): Promise<void>
}
export interface IOptions {
  storage?: any,
  jsonify?: boolean,
  readonly whitelist?: Array<string>,
  readonly blacklist?: Array<string>
}
type StrToAnyMap = {[key: string]: any}

export const persist: IArgs = (name, store, options = {}) => {
  let {storage, jsonify, whitelist, blacklist} = options

  if (typeof window.localStorage !== 'undefined' && (!storage || storage === window.localStorage)) {
    storage = AsyncLocalStorage
  }
  if (!jsonify) { jsonify = true } // default to true like mobx-persist
  const whitelistDict = arrToDict(whitelist)
  const blacklistDict = arrToDict(blacklist)

  onSnapshot(store, (_snapshot: StrToAnyMap) => {
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
    .then((data: object | string) => {
      const snapshot = !isString(data) ? data : JSON.parse(data)
      // don't apply falsey (which will error), leave store in initial state
      if (!snapshot) { return }
      applySnapshot(store, snapshot)
    })
}

type StrToBoolMap = {[key: string]: boolean}

function arrToDict (arr?: Array<string>): StrToBoolMap {
  if (!arr) { return {} }
  return arr.reduce((dict: StrToBoolMap, elem) => {
    dict[elem] = true
    return dict
  }, {})
}

function isString (value: any): value is string {
  return typeof value === 'string'
}

export default persist
