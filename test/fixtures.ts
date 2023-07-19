import { types } from 'mobx-state-tree'

export const UserStoreF = types.model('UserStore', {
  name: 'John Doe',
  age: 32,
  hasDogs: true,
}).actions((self) => ({
  changeName(name: string) {
    self.name = name
  }
}))

export const persistedDataF = {
  name: 'Persisted Name',
  age: 35,
  hasDogs: false,
}
