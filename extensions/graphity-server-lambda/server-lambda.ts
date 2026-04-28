import { ApolloServer, Config } from 'apollo-server-lambda'
import { APIGatewayProxyCallback, APIGatewayProxyEvent, APIGatewayProxyHandler, Context } from 'aws-lambda'
import { applyHttpContext, Graphity } from 'graphity'

import { eventToHttpRequest } from './event-to-http-request'

export interface ServerLambdaOptions {
  callbackWaitsForEmptyEventLoop?: boolean
  apolloOptions?: Omit<Config, 'schema' | 'context'>
  cors?: {
    origin?: boolean | string | string[],
    methods?: string | string[],
    allowedHeaders?: string | string[],
    exposedHeaders?: string | string[],
    credentials?: boolean,
    maxAge?: number,
  }
}

export class ServerLambda {

  apolloHandlerPromise: Promise<APIGatewayProxyHandler> | null = null

  constructor(public graphity: Graphity, public _options: ServerLambdaOptions = {}) {
  }

  execute(event: APIGatewayProxyEvent, context: Context, callback: APIGatewayProxyCallback): void {
    if (!this.apolloHandlerPromise) {
      this.apolloHandlerPromise = this.graphity.boot().then(() => {
        const apollo = new ApolloServer({
          ...this._options.apolloOptions,
          schema: this.graphity.createSchema() as any,
          context: (context: { event: APIGatewayProxyEvent}) => applyHttpContext(this.graphity, eventToHttpRequest(context.event)),
        })
        return apollo.createHandler({
          expressGetMiddlewareOptions: {
            cors: this._options.cors,
          },
        })
      })
    }
    if (this._options.callbackWaitsForEmptyEventLoop !== null && typeof this._options.callbackWaitsForEmptyEventLoop !== 'undefined') {
      context.callbackWaitsForEmptyEventLoop = this._options.callbackWaitsForEmptyEventLoop
    }
    this.apolloHandlerPromise.then((handler) => { handler(event, context, callback) })
  }
}
