import { Middleware, MiddlewareCarry, MiddlewareClass, MiddlewareNext } from '@graphity/schema'

import { GraphityError } from '../../errors/graphity-error'
import { GraphityAuth } from '../../interfaces/auth'
import { GraphityContext } from '../../interfaces/context'

export function Authorized<TRole extends string = string>(): MiddlewareClass
export function Authorized<TRole extends string = string>(role: TRole | TRole[]): MiddlewareClass
export function Authorized<TRole extends string = string>(role: TRole | TRole[], handler: (auth: GraphityAuth<any, TRole>, resource: any) => boolean | Promise<boolean>): MiddlewareClass
export function Authorized<TRole extends string = string>(handler: (auth: GraphityAuth<any, TRole>, resource: any) => boolean | Promise<boolean>): MiddlewareClass
export function Authorized<TRole extends string = string>(
  roleOrHandler?: TRole | TRole[],
  handler?: (auth: GraphityAuth<any, TRole>, resource: any) => boolean | Promise<boolean>,
): MiddlewareClass {
  let role: TRole | TRole[] | undefined
  if (typeof roleOrHandler === 'function') {
    handler = roleOrHandler
  } else {
    role = roleOrHandler
  }

  return class implements Middleware<null, GraphityContext<any, TRole>> {
    async handle({ context }: MiddlewareCarry<null, GraphityContext<any, TRole>>, next: MiddlewareNext<null, GraphityContext<any, TRole>>) {
      if (!context.$auth || !context.$auth.user) {
        throw new GraphityError('Access denied.', 'UNAUTHORIZED')
      }

      this._handleBefore(context.$auth)
      const resource = await next()
      await this._handleAfter(context.$auth, resource)
      return resource
    }

    _handleBefore(auth: GraphityAuth<any, TRole>): void {
      if (!role) { // roles not defined, ignore
        return
      }
      for (const eachRole of Array.isArray(role) ? role : [role]) {
        if (auth.roles.includes(eachRole)) {
          return
        }
      }
      throw new GraphityError('Access denied.', 'FORBIDDEN')
    }

    async _handleAfter(auth: GraphityAuth<any, TRole>, resource: any) {
      if (handler) {
        if (!await handler(auth, resource)) {
          throw new GraphityError('Access denied.', 'FORBIDDEN')
        }
      }
    }
  }
}
