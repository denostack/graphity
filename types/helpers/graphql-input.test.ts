import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql'

import { GraphQLInput } from './graphql-input'

describe('testsuite of helpers/graphql-input', () => {
  it('test simple', () => {
    const input = GraphQLInput({
      name: 'CreateUser',
      description: 'create user input!',
      fields: {
        id: GraphQLNonNull(GraphQLID),
        name: GraphQLString,
        email: GraphQLString,
        address: {
          address1: GraphQLNonNull(GraphQLString),
          address2: GraphQLString,
          zipcode: GraphQLString,
        },
      },
    })
    expect(input).toEqualGraphQLType(`
    """create user input!"""
      input CreateUser {
        id: ID!
        name: String
        email: String
        address: CreateUserAddress
      }
    `)
    expect(input.getFields().address.type).toEqualGraphQLType(`
      input CreateUserAddress {
        address1: String!
        address2: String
        zipcode: String
      }
    `)
  })
})
