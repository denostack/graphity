import { Containable } from '@graphity/container'
import { IncomingHttpHeaders } from 'http'

import { GraphityAuth, UserIdentifier } from './auth'
import { PubSub } from './subscriptions'

export interface HttpRequest {
  host?: string
  method: string
  headers: IncomingHttpHeaders
  path: string
  query: Record<string, any>
  raw: any
}

export interface GraphityContext<TUser extends UserIdentifier = UserIdentifier, TRole extends string = string> {
  $request?: HttpRequest
  $container: Containable
  $auth?: GraphityAuth<TUser, TRole>
  $pubsub?: PubSub
}
