import { onSnapshot, applySnapshot, IStateTreeNode } from 'mobx-state-tree'

import AsyncLocalStorage from './asyncLocalStorage'

export interface IArgs {
  (name: string, store: IStateTreeNode, options?: IOptions): Promise<void>
}
export interface IOptions {
  storage?: any,
  jsonify?: boolean,
  readonly whitelist?: Array<string>,
  readonly blacklist?: Array<string>,
  nodeNoop?: boolean
}
type StrToAnyMap = {[key: string]: any}

export const persist: IArgs = (name, store, options = {}) => {
  let {storage, jsonify, whitelist, blacklist, nodeNoop} = options

  // no-op in node by default to support SSR out-of-the-box
  // require explicit opt-in to hydrate server-side
  if (!nodeNoop) { nodeNoop = true }
  if (nodeNoop && typeof window === 'undefined') { return Promise.resolve() }

  // use AsyncLocalStorage by default or if window.localStorage was passed in
  if (
    typeof window !== 'undefined' &&
    typeof window.localStorage !== 'undefined' &&
    (!storage || storage === window.localStorage)
  ) {
    storage = AsyncLocalStorage
  }
  if (!storage) {
    return Promise.reject('localStorage (the default storage engine) is not ' +
      'supported in this environment. Please configure a different storage ' +
      'engine via the `storage:` option.')
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
