import { DocumentNode, execute, GraphQLSchema } from 'graphql'


export interface GraphQLExecutorOptions {
  schema: GraphQLSchema
  rootValue?: any
}

export class GraphQLExecutor {

  public constructor(public options: GraphQLExecutorOptions) {
  }

  public async execute(document: DocumentNode, values?: {[key: string]: any}, context?: any): Promise<any> {
    const result = await execute(
      this.options.schema,
      document,
      this.options.rootValue,
      context,
      values
    )
    if (result.errors) {
      throw Object.assign(new Error('error occured'), { errors: result.errors })
    }
    return result.data || null
  }
}
