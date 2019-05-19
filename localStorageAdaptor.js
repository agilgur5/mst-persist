export function clear () {
  return callWithPromise(window.localStorage.clear)
}

export function getItem (key) {
  return callWithPromise(window.localStorage.getItem, key)
}

export function removeItem (key) {
  return callWithPromise(window.localStorage.removeItem, key)
}

export function setItem (key, value) {
  return callWithPromise(window.localStorage.setItem, key, value)
}

function callWithPromise (func, ...args) {
  try {
    return Promise.resolve(func(...args))
  } catch (err) {
    return Promise.reject(err)
  }
}
