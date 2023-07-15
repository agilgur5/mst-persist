import { ITransform, arrToDict } from './utils'

export function blacklistKeys (blacklist: Array<string>): ITransform {
  const blacklistDict = arrToDict(blacklist)

  return {toStorage: function blacklistTransform (snapshot) {
    Object.keys(snapshot).forEach((key) => {
      if (blacklistDict[key]) { delete snapshot[key] }
    })
    return snapshot
  }}
}
