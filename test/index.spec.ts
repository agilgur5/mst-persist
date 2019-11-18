/// <reference types="@types/jest" />
import { getSnapshot } from 'mobx-state-tree'

import { persist } from '../src/index'
import { UserStore } from './fixtures'

function getItem(key: string) {
  const item = window.localStorage.getItem(key)
  return item ? JSON.parse(item) : null // can only parse strings
}

describe('basic persist options', () => {
  beforeEach(() => window.localStorage.clear())

  it('should persist nothing if no actions are used', async () => {
    const user = UserStore.create()
    await persist('user', user)

    expect(getItem('user')).toBe(null)
  })

  it('should persist snapshot when action used', async () => {
    const user = UserStore.create()
    await persist('user', user)

    user.changeName('Joe') // fire action to trigger onSnapshot
    expect(getItem('user')).toStrictEqual(getSnapshot(user))
  })

  it('should whitelist', async () => {
    const user = UserStore.create()
    await persist('user', user, {
      whitelist: ['name']
    })

    user.changeName('Joe') // fire action to trigger onSnapshot
    const snapshot = { ...getSnapshot(user) } // need to shallow clone as otherwise properties are non-configurable (https://github.com/agilgur5/mst-persist/pull/21#discussion_r348105595)
    delete snapshot['age']
    expect(getItem('user')).toStrictEqual(snapshot)
  })

  it('should blacklist', async () => {
    const user = UserStore.create()
    await persist('user', user, {
      blacklist: ['age']
    })

    user.changeName('Joe') // fire action to trigger onSnapshot
    const snapshot = { ...getSnapshot(user) } // need to shallow clone as otherwise properties are non-configurable (https://github.com/agilgur5/mst-persist/pull/21#discussion_r348105595)
    delete snapshot['age']
    expect(getItem('user')).toStrictEqual(snapshot)
  })
})
