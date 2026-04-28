import { DocumentNode } from 'graphql'
import { IncomingMessage } from 'http'

import { MaybePromise } from './utils'


export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface GraphQLQuery {
  document: DocumentNode
  values?: {[key: string]: any}
  transform?: (data: any) => any
}

export interface HttpEndPoint<TRequest = IncomingMessage> {
  method: HttpMethod
  path: string
  query(request: TRequest): MaybePromise<GraphQLQuery>
}

export interface CreateOptions<TRequest> {
  endpoints: HttpEndPoint<TRequest>[]
  rootValue?: any
  context?: (request: TRequest) => any
}
