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
[![typings](https://img.shields.io/npm/types/mst-persist.svg)](https://github.com/agilgur5/mst-persist/blob/master/src/index.ts)
[![build status](https://img.shields.io/travis/agilgur5/mst-persist/master.svg)](https://travis-ci.org/agilgur5/mst-persist)
[![code coverage](https://img.shields.io/codecov/c/gh/agilgur5/mst-persist/master.svg)](https://codecov.io/gh/agilgur5/mst-persist)
<br>
[![NPM](https://nodei.co/npm/mst-persist.png?downloads=true&downloadRank=true&stars=true)](https://npmjs.org/package/mst-persist)

Persist and hydrate [MobX-state-tree](https://github.com/mobxjs/mobx-state-tree) stores.

## Installation

`npm i -S mst-persist`

## Usage

```javascript
import { types } from 'mobx-state-tree'
import localForage from 'localForage'
import { persist } from 'mst-persist'
import { whitelistKeys } from 'mst-persist/transforms'

const SomeStore = types.model('Store', {
  name: 'John Doe',
  age: 32
})

const someStore = SomeStore.create()

persist('some', someStore, {
  storage: localForage,  // or AsyncStorage in react-native.
                         // default: localStorage
  jsonify: false,  // if you use AsyncStorage, this should be true
                   // default: true
  transforms: [
    whitelistKeys(['name']) // only these keys will be persisted
  ]
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
    - **transforms** *Array\<[Transform](#transforms)\>* [Transforms](#transforms) to apply to snapshots on the way to and from storage.

- returns a void Promise

#### From `mst-persist/transforms`

##### `whitelistKeys(keys)`

- arguments
  - **keys** *Array\<string\>* Only these keys will be persisted (by default, all keys are persisted).

##### `blacklistKeys(keys)`

- arguments
  - **keys** *Array\<string\>* These keys will not be persisted (by default, all keys are persisted).

### Transforms

Transforms allow you to customize the [snapshot](https://github.com/mobxjs/mobx-state-tree#snapshots) that is persisted and used to hydrate your store.

Transforms are `object`s with `toStorage` and `fromStorage` functions that are called with a `snapshot`-like argument and expected to return a `snapshot`-like object:

```typescript
interface ITransform {
  readonly toStorage?: ITransformArgs,
  readonly fromStorage?: ITransformArgs
}
interface ITransformArgs {
  (snapshot: StrToAnyMap): StrToAnyMap
}
type StrToAnyMap = {[key: string]: any}
```

You can create your own transforms to serve a variety of needs.
For example, if you wanted to only store the most recent posts:

```typescript
import { persist, ITransform } from 'mst-persist'

import { FeedStore } from '../stores'

const feedStore = FeedStore.create()

const twoDaysAgo = new Date()
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

const onlyRecentPosts: ITransform = {
  toStorage: (snapshot) => {
    snapshot.posts = snapshot.posts.filter(
      // note that a snapshotted Date is a string
      post => new Date(post.date) > twoDaysAgo
    )
    return snapshot
  }
}

persist('feed', feedStore, {
  transforms: [onlyRecentPosts]
})
```

For some other examples, one may see how [whitelists](https://github.com/agilgur5/mst-persist/blob/9ba76aaf455f42e249dc855d66349351148a17da/src/whitelistTransform.ts#L7-L12) and [blacklists](https://github.com/agilgur5/mst-persist/blob/9ba76aaf455f42e249dc855d66349351148a17da/src/blacklistTransform.ts#L7-L12) are implemented internally as transforms, as well as how the [transform test fixtures](https://github.com/agilgur5/mst-persist/blob/d3aa4476f92a087c882dccf8530a37096d8c64ed/test/fixtures.ts#L19-L34) are implemented internally.

#### Transform Ordering

`toStorage` functions are called serially in the order specified in the `transforms` configuration array.
`fromStorage` functions are called in the reverse order, such that the last transform is first.

Before any `toStorage` functions are run, the snapshot will first be stripped of any keys as specified by the `whitelist` and `blacklist` configuration.
Then, once the `toStorage` functions are all run, the object will be serialized to JSON, if that configuration is enabled.

Before any `fromStorage` functions are run, the JSON will be deserialized into an object, if that configuration is enabled.

To put this visually with some pseudo-code:

```text
onSnapshot -> whitelist -> blacklist -> transforms toStorage -> JSON.stringify -> Storage.setItem
Storage.getItem -> JSON.parse -> transforms.reverse() fromStorage -> applySnapshot
```

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

Basically a small wrapper around MST's [`onSnapshot` and `applySnapshot`](https://github.com/mobxjs/mobx-state-tree#snapshots).
The source code is roughly the size of this README, so [take a look under the hood](https://github.com/agilgur5/mst-persist/tree/master/src)! :)

## Credits

Inspiration for parts of the code and API came from [`redux-persist`](https://github.com/rt2zz/redux-persist), [`mobx-persist`](https://github.com/pinqy520/mobx-persist), and [this MST persist PoC gist](https://gist.github.com/benjick/c48dd2db575e79c7b0b1043de4556ebc)
