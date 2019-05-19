# mst-persist

[![package-json](https://img.shields.io/github/package-json/v/agilgur5/mst-persist.svg)](https://npmjs.org/package/mst-persist)
[![releases](https://img.shields.io/github/release/agilgur5/mst-persist.svg)](https://github.com/agilgur5/mst-persist/releases)
[![commits](https://img.shields.io/github/commits-since/agilgur5/mst-persist/latest.svg)](https://github.com/agilgur5/mst-persist/commits/master)

[![dt](https://img.shields.io/npm/dt/mst-persist.svg)](https://npmjs.org/package/mst-persist)
[![dy](https://img.shields.io/npm/dy/mst-persist.svg)](https://npmjs.org/package/mst-persist)
[![dm](https://img.shields.io/npm/dm/mst-persist.svg)](https://npmjs.org/package/mst-persist)
[![dw](https://img.shields.io/npm/dw/mst-persist.svg)](https://npmjs.org/package/mst-persist)

[![NPM](https://nodei.co/npm/mst-persist.png?downloads=true&downloadRank=true&stars=true)](https://npmjs.org/package/mst-persist)

Persist and hydrate MobX-state-tree stores.

## Installation

`npm i -S agilgur5/mst-persist`

The `mst-persist` NPM package is not currently owned by me, so please install via GitHub for now.
Will be looking to get ownership of the package [from the owner](https://github.com/pinqy520/mobx-persist/issues/37#issuecomment-361479253) shortly.

## Usage

```javascript
import { types } from 'mobx-state-tree'
import localForage from 'localForage'
import { persist } from 'mst-persist'

const SomeStore = types.model('Store', {
  name: 'John Doe',
  age: 32
})

const someStore = SomeStore.create()

persist('some', someStore, {
  storage: localForage,  // or AsyncStorage in react-native.
                         // default: localStorage
  jsonify: false  // if you use AsyncStorage, this shoud be true
                  // default: true
  whitelist: ['name']  // only these keys will be persisted
}).then(() => console.log('someStore has been hydrated'))

```

### API

#### `persist(key, store, options)`

- arguments
  - **key** *string* The key of your storage engine that you want to persist to.
  - **store** *MST store* The store to be persisted.
  - **options** *object* Additional configuration options.
    - **storage** *[localForage](https://github.com/localForage/localForage) / AsyncStorage / localStorage* [localForage](https://github.com/localForage/localForage)-style storage API. localStorage for Web (default), AsyncStorage for React Native.
    - **jsonify** *bool* Enables serialization as JSON (default: `true`).
    - **whitelist** *Array\<string\>* Only these keys will be persisted (defaults to all keys).
    - **blacklist** *Array\<string\>* These keys will not be persisted (defaults to all keys).

- returns a void Promise

## How it works

Basically just a small wrapper around MST's `onSnapshot` and `applySnapshot`.
The source code is currently shorter than this README, so take a look under the hood! :)

## Credits

Inspiration for parts of the code and API came from [`redux-persist`](https://github.com/rt2zz/redux-persist), [`mobx-persist`](https://github.com/pinqy520/mobx-persist), and [this MST persist PoC gist](https://gist.github.com/benjick/c48dd2db575e79c7b0b1043de4556ebc)
