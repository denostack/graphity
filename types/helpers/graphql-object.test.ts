import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql'

import { GraphQLObject } from './graphql-object'

describe('testsuite of helpers/graphql-object', () => {
  it('test simple', () => {
    const object = GraphQLObject({
      name: 'User',
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

    expect(object).toEqualGraphQLType(`
      type User {
        id: ID!
        name: String
        email: String
        address: UserAddress
      }
    `)
    expect(object.getFields().address.type).toEqualGraphQLType(`
      type UserAddress {
        address1: String!
        address2: String
        zipcode: String
      }
    `)
  })
})
