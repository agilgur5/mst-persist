export const AsyncLocalStorage = {
  clear () {
    return callWithPromise(window.localStorage.clear)
  },
  getItem (key) {
    return callWithPromise(window.localStorage.getItem, key)
  },
  removeItem (key) {
    return callWithPromise(window.localStorage.removeItem, key)
  },
  setItem (key, value) {
    return callWithPromise(window.localStorage.setItem, key, value)
  }
}

function callWithPromise (func, ...args) {
  try {
    return Promise.resolve(func(...args))
  } catch (err) {
    return Promise.reject(err)
  }
}

export default AsyncLocalStorage
