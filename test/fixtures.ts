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

export const persistedUserDataF = {
  name: 'Persisted Name',
  age: 35,
  hasDogs: false,
}

export const ComplexUserStoreF = types.model('ComplexUserStore', {
  name: 'John Doe',
  dogs: types.array(types.string),
}).actions((self) => ({
  addDog(dog: string) {
    self.dogs.push(dog)
  }
}))

export const persistedComplexUserDataF = {
  name: 'John Doe',
  dogs: ['Shadow', 'Sparky'],
}
