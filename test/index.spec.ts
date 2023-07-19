import { describe, it, expect, beforeEach } from 'jest-without-globals'
import { getSnapshot } from 'mobx-state-tree'

import { persist } from '../src/index'

import { getItem } from './helpers'
import { UserStoreF, persistedUserDataF } from './fixtures'

describe('basic persist functionality with primitves', () => {
  beforeEach(() => window.localStorage.clear())

  it('should persist nothing if no actions are used', async () => {
    const user = UserStoreF.create()
    await persist('user', user)

    expect(getItem('user')).toBe(null)
  })

  it('should persist snapshot when action used', async () => {
    const user = UserStoreF.create()
    await persist('user', user)

    user.changeName('Joe') // fire action to trigger onSnapshot
    expect(user.name).toBe('Joe')
    expect(getItem('user')).toStrictEqual(getSnapshot(user))
  })

  it('should load persisted data', async () => {
    window.localStorage.setItem('user', JSON.stringify(persistedUserDataF))

    const user = UserStoreF.create()
    await persist('user', user)
    expect(getSnapshot(user)).toStrictEqual(persistedUserDataF)
  })
})

describe('persist options', () => {
  beforeEach(() => window.localStorage.clear())

  it('shouldn\'t jsonify', async () => {
    const user = UserStoreF.create()
    await persist('user', user, {
      jsonify: false
    })

    user.changeName('Joe') // fire action to trigger onSnapshot
    // if not jsonified, localStorage will store as '[object Object]'
    expect(window.localStorage.getItem('user')).toBe('[object Object]')
  })

  it('should whitelist', async () => {
    const user = UserStoreF.create()
    await persist('user', user, {
      whitelist: ['name', 'hasDogs']
    })

    user.changeName('Joe') // fire action to trigger onSnapshot
    const snapshot = { ...getSnapshot(user) } // need to shallow clone as otherwise properties are non-configurable (https://github.com/agilgur5/mst-persist/pull/21#discussion_r348105595)
    delete snapshot['age']
    expect(snapshot.name).toBe('Joe')
    expect(getItem('user')).toStrictEqual(snapshot)
  })

  it('should blacklist', async () => {
    const user = UserStoreF.create()
    await persist('user', user, {
      blacklist: ['age']
    })

    user.changeName('Joe') // fire action to trigger onSnapshot
    const snapshot = { ...getSnapshot(user) } // need to shallow clone as otherwise properties are non-configurable (https://github.com/agilgur5/mst-persist/pull/21#discussion_r348105595)
    delete snapshot['age']
    expect(snapshot.name).toBe('Joe')
    expect(getItem('user')).toStrictEqual(snapshot)
  })
})
