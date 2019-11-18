import { types } from 'mobx-state-tree'

export const UserStore = types.model('UserStore', {
  name: 'John Doe',
  age: 32
})
