import { ITransform, arrToDict } from './utils'

export function whitelistKeys (whitelist: Array<string>): ITransform {
  const whitelistDict = arrToDict(whitelist)

  return {toStorage: function whitelistTransform (snapshot) {
    Object.keys(snapshot).forEach((key) => {
      if (!whitelistDict[key]) { delete snapshot[key] }
    })
    return snapshot
  }}
}
