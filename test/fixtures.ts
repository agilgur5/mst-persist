import { types } from 'mobx-state-tree'

import { ITransform, ITransformArgs } from '../src/index'

export const UserStoreF = types.model('UserStore', {
  name: 'John Doe',
  age: 32
}).actions((self) => ({
  changeName(name: string) {
    self.name = name
  }
}))

export const persistedDataF = {
  name: 'Persisted Name',
  age: 35
}

function changeName (name: string) {
  const changeNameTransform: ITransformArgs = function (snapshot) {
    snapshot.name = name
    return snapshot
  }
  return changeNameTransform
}

export function storeNameAsF (name: string): ITransform {
  return {toStorage: changeName(name)}
}

export function retrieveNameAsF (name: string): ITransform {
  return {fromStorage: changeName(name)}
}
