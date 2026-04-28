import { Name } from '../interfaces/common'
import { nameToString } from '../utils/nameToString'

export class UndefinedError extends Error {
  public constructor(
    public target: Name<any>,
    public resolveStack: Name<any>[] = [],
  ) {
    super(`${nameToString(target)} is not defined!
resolve stack: ${resolveStack.map(target => nameToString(target)).join(' -> ')}`)
    this.name = 'UndefinedError'
  }
}
