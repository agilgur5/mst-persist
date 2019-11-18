/// <reference types="@types/jest" />

import { persist } from '../src/index'
import { UserStore } from './fixtures'

describe('initialization', () => {
  beforeEach(() => window.localStorage.clear())

  it('should persist nothing if no actions are used', async () => {
    const user = UserStore.create()
    await persist('user', user)

    expect(window.localStorage.getItem('user')).toBe(null)
  })
})
