import { onSnapshot, applySnapshot, IStateTreeNode } from 'mobx-state-tree'

import AsyncLocalStorage from './asyncLocalStorage'
import { ITransform, whitelistKeys, blacklistKeys } from './transforms/index'
import { StrToAnyMap } from './utils'

export interface IArgs {
  (name: string, store: IStateTreeNode, options?: IOptions): Promise<void>
}
export interface IOptions {
  storage?: any,
  jsonify?: boolean,
  readonly whitelist?: Array<string>,
  readonly blacklist?: Array<string>,
  readonly transforms?: Array<ITransform>
}
export { ITransform, ITransformArgs } from './transforms/index'

export const persist: IArgs = (name, store, options = {}) => {
  let {storage, jsonify = true, whitelist, blacklist, transforms = []} = options

  // use AsyncLocalStorage by default (or if localStorage was passed in)
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

  // whitelist, blacklist, then any custom transforms
  transforms = [
    ...(whitelist ? [whitelistKeys(whitelist)] : []),
    ...(blacklist ? [blacklistKeys(blacklist)] : []),
    ...transforms
  ]

  onSnapshot(store, (_snapshot: StrToAnyMap) => {
    // need to shallow clone as otherwise properties are non-configurable (https://github.com/agilgur5/mst-persist/pull/21#discussion_r348105595)
    const snapshot = { ..._snapshot }

    transforms.forEach((transform) => {
      if (transform.toStorage) { transform.toStorage(snapshot) }
    })

    const data = !jsonify ? snapshot : JSON.stringify(snapshot)
    storage.setItem(name, data)
  })

  return storage.getItem(name)
    .then((data: object | string) => {
      const snapshot = !isString(data) ? data : JSON.parse(data)
      // don't apply falsey (which will error), leave store in initial state
      if (!snapshot) { return }

      // in reverse order, like a stack, so that last transform is first
      transforms.slice().reverse().forEach((transform) => {
        if (transform.fromStorage) { transform.fromStorage(snapshot) }
      })

      applySnapshot(store, snapshot)
    })
}

function isString (value: any): value is string {
  return typeof value === 'string'
}

export default persist
