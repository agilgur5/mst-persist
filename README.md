# mst-persist

<!-- releases / versioning -->
[![package-json](https://img.shields.io/github/package-json/v/agilgur5/mst-persist.svg)](https://npmjs.org/package/mst-persist)
[![releases](https://img.shields.io/github/tag-pre/agilgur5/mst-persist.svg)](https://github.com/agilgur5/mst-persist/releases)
[![commits](https://img.shields.io/github/commits-since/agilgur5/mst-persist/v0.1.3.svg)](https://github.com/agilgur5/mst-persist/commits/master)
<br><!-- downloads -->
[![dt](https://img.shields.io/npm/dt/mst-persist.svg)](https://npmjs.org/package/mst-persist)
[![dy](https://img.shields.io/npm/dy/mst-persist.svg)](https://npmjs.org/package/mst-persist)
[![dm](https://img.shields.io/npm/dm/mst-persist.svg)](https://npmjs.org/package/mst-persist)
[![dw](https://img.shields.io/npm/dw/mst-persist.svg)](https://npmjs.org/package/mst-persist)
<br><!-- status / activity -->
[![typings](https://img.shields.io/npm/types/mst-persist.svg)](src/index.ts)
[![build status](https://img.shields.io/github/actions/workflow/status/agilgur5/mst-persist/ci.yml?branch=main)](https://github.com/agilgur5/mst-persist/actions/workflows/ci.yml?query=branch%3Amain)
[![code coverage](https://img.shields.io/codecov/c/gh/agilgur5/mst-persist/master.svg)](https://codecov.io/gh/agilgur5/mst-persist)

Persist and hydrate [MobX-state-tree](https://github.com/mobxjs/mobx-state-tree) stores.

## Installation

```sh
npm i -S mst-persist
```

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
  - **store** *[MST](https://github.com/mobxjs/mobx-state-tree) store* The store to be persisted.
  - **options** *object* Additional configuration options.
    - **storage** *[localForage](https://github.com/localForage/localForage) / [AsyncStorage](https://github.com/react-native-community/async-storage) / [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)*
      Any Storage Engine that has a Promise-style API similar to [`localForage`](https://github.com/localForage/localForage).
      The default is [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), which has a built-in adaptor to make it support Promises.
      For React Native, one may configure [`AsyncStorage`](https://github.com/react-native-community/async-storage) instead.
      <br>
      Any of [`redux-persist`'s Storage Engines](https://github.com/rt2zz/redux-persist#storage-engines) should also be compatible with `mst-persist`.
    - **jsonify** *bool* Enables serialization as JSON (default: `true`).
    - **whitelist** *Array\<string\>* Only these keys will be persisted (defaults to all keys).
    - **blacklist** *Array\<string\>* These keys will not be persisted (defaults to all keys).

- returns a void Promise

### Node and Server-Side Rendering (SSR) Usage

Node environments are supported so long as you configure a Storage Engine that supports Node, such as [`redux-persist-node-storage`](https://github.com/pellejacobs/redux-persist-node-storage), [`redux-persist-cookie-storage`](https://github.com/abersager/redux-persist-cookie-storage), etc.
This allows you to hydrate your store server-side.

For SSR though, you may not want to hydrate your store server-side, so in that case you can call `persist` conditionally:

```javascript
if (typeof window !== 'undefined') { // window is undefined in Node
  persist(...)
}
```

With this conditional check, your store will only be hydrated client-side.

## Examples

None yet, but can take a look at [agilgur5/react-native-manga-reader-app](https://github.com/agilgur5/react-native-manga-reader-app) which uses it in production.
Can view the commit that implements it [here](https://github.com/agilgur5/react-native-manga-reader-app/pull/2/commits/286725f417d321f25d16ee3858b0e7e6b7886e77).

## How it works

Basically just a small wrapper around MST's [`onSnapshot` and `applySnapshot`](https://github.com/mobxjs/mobx-state-tree#snapshots).
The source code is currently shorter than this README, so [take a look under the hood](https://github.com/agilgur5/mst-persist/tree/master/src)! :)

## Credits

Inspiration for parts of the code and API came from [`redux-persist`](https://github.com/rt2zz/redux-persist), [`mobx-persist`](https://github.com/pinqy520/mobx-persist), and [this MST persist PoC gist](https://gist.github.com/benjick/c48dd2db575e79c7b0b1043de4556ebc)
