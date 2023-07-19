import { describe, it, expect, beforeEach } from 'jest-without-globals'
import { getSnapshot } from 'mobx-state-tree'

import { persist } from '../src/index'

import { getItem } from './helpers'
import { ComplexUserStoreF, persistedComplexUserDataF } from './fixtures'

describe('persist complex types', () => {
  beforeEach(() => window.localStorage.clear())

  it('should persist an array', async () => {
    const user = ComplexUserStoreF.create()
    await persist('user', user)

    user.addDog('Shadow') // fire action to trigger onSnapshot
    expect(user.dogs).toStrictEqual(['Shadow'])
    expect(getItem('user')).toStrictEqual(getSnapshot(user))
  })

  it('should persist a whitelisted array', async () => {
    const user = ComplexUserStoreF.create()
    await persist('user', user, {
      whitelist: ['name', 'dogs']
    })

    user.addDog('Shadow') // fire action to trigger onSnapshot
    expect(user.dogs).toStrictEqual(['Shadow'])
    expect(getItem('user')).toStrictEqual(getSnapshot(user))
  })

  it('should load a persisted array', async () => {
    window.localStorage.setItem('user', JSON.stringify(persistedComplexUserDataF))

    const user = ComplexUserStoreF.create()
    await persist('user', user)
    expect(getSnapshot(user)).toStrictEqual(persistedComplexUserDataF)
  })
})
