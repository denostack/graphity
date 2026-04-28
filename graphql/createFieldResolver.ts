import { MiddlewareCarry } from '@graphity/schema'
import { Middleware } from '@graphity/schema/src/interfaces/middleware'
import { GraphQLFieldResolver } from 'graphql'

import { BatchLockFinish, createBatchLock } from '../utils/createBatchLock'


function execute<
  TSource,
  TContext,
  TArgs = Record<string, any>
>(
  carry: MiddlewareCarry<TSource, TContext, TArgs>,
  middlewares: Middleware<TSource, TContext, TArgs>[],
  resolve: GraphQLFieldResolver<TSource, TContext, TArgs>,
  done: BatchLockFinish,
): Promise<any> {
  if (middlewares.length > 0) {
    const [currentMiddleware, ...nextMiddlewares] = middlewares
    return Promise.resolve(currentMiddleware.handle(carry, (next = {}) => {
      return execute(
        {
          parent: typeof next.parent === 'undefined' ? carry.parent : next.parent,
          args: typeof next.args === 'undefined' ? carry.args : next.args,
          context: typeof next.context === 'undefined' ? carry.context : next.context,
          info: typeof next.info === 'undefined' ? carry.info : next.info,
        },
        nextMiddlewares,
        resolve,
        done
      )
    })).then((result) => done().then(() => result))
  }
  return done().then(() => resolve(carry.parent, carry.args, carry.context, carry.info))
}

export function createFieldResolver<
  TSource,
  TContext,
  TArgs = Record<string, any>
>(
  middlewares: Middleware<TSource, TContext, TArgs>[],
  resolve: GraphQLFieldResolver<TSource, TContext, TArgs>
): GraphQLFieldResolver<TSource, TContext, TArgs> {
  const startLock = createBatchLock()
  return (parent, args, context, info) => {
    const finishLock = startLock()
    return execute<TSource, TContext, TArgs>({ parent, args, context, info }, middlewares, resolve, finishLock)
  }
}
