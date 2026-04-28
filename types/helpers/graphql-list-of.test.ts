import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'

import { GraphQLListOf } from './graphql-list-of'

describe('testsuite of helpers/graphql-list-of', () => {
  it('test list of scalar', () => {
    const listOf = GraphQLListOf(GraphQLString)
    expect(listOf).toEqualGraphQLType(`
      type ListOfString {
        count: Int!
        nodes: [String!]!
      }
    `)
  })

  it('test list of object', () => {
    const listOf = GraphQLListOf(new GraphQLObjectType({
      name: 'User',
      fields: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
      },
    }))
    expect(listOf).toEqualGraphQLType(`
      type ListOfUser {
        count: Int!
        nodes: [User!]!
      }
    `)
    expect((listOf.getFields().nodes.type as GraphQLNonNull<GraphQLList<GraphQLNonNull<any>>>).ofType.ofType.ofType).toEqualGraphQLType(`
      type User {
        id: ID!
        name: String
      }
    `)
  })
})
