import { StrToAnyMap } from '../utils'

export interface ITransform {
  readonly toStorage?: ITransformArgs,
  readonly fromStorage?: ITransformArgs
}
export interface ITransformArgs {
  (snapshot: StrToAnyMap): StrToAnyMap
}

type StrToBoolMap = {[key: string]: boolean}

export function arrToDict (arr?: Array<string>): StrToBoolMap {
  if (!arr) { return {} }
  return arr.reduce((dict: StrToBoolMap, elem) => {
    dict[elem] = true
    return dict
  }, {})
}
