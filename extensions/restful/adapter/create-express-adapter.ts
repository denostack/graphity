import { Request, RequestHandler, Router } from 'express'
import { GraphQLSchema } from 'graphql'

import { CreateOptions } from '../interfaces/restful'
import { GraphQLExecutor } from '../restful/graphql-executor'

const defaultTransform = (data: any) => data

export function createExpressAdapter(schema: GraphQLSchema, options: CreateOptions<Request>): RequestHandler {
  const executor = new GraphQLExecutor({
    schema,
    rootValue: options.rootValue,
  })
  const context = options.context || ((request) => ({ request }))
  const router = Router()
  for (const endpoint of options.endpoints || []) {
    const method = endpoint.method.toLowerCase() as 'get' | 'post' | 'delete' | 'put'
    const path = endpoint.path.startsWith('/') ? endpoint.path : `/${endpoint.path}`
    router[method](path, async (req, res) => {
      try {
        const { document, values, transform } = await endpoint.query(req)
        const result = await executor.execute(document, values, context(req))
        res.json({
          data: (transform || defaultTransform)(result),
        })
      } catch (error) {
        res.status(500).json({
          message: (error as Error).message,
          error,
        })
      }
    })
  }
  return router
}
