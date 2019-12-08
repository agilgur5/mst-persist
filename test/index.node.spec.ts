/**
 * @jest-environment node
 */
// add tests in this file that are specific to node (vs. jsdom)

import { describe, it, expect } from 'jest-without-globals'

import { persist } from '../src/index'
import { UserStoreF } from './fixtures'

describe('node usage', () => {
  it('should error on default localStorage usage', async () => {
    const user = UserStoreF.create()
    await expect(persist('user', user)).rejects.toMatch(/^localStorage.+$/)
  })
})
