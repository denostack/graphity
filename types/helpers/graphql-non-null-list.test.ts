import { GraphQLBoolean, GraphQLObjectType, GraphQLString } from 'graphql'

import { GraphQLNonNullList } from './graphql-non-null-list'

describe('testsuite of helpers/graphql-non-null-list', () => {
  it('test with scalar', () => {
    expect(GraphQLNonNullList(GraphQLString)).toEqualGraphQLType('[String!]!')
    expect(GraphQLNonNullList(GraphQLBoolean)).toEqualGraphQLType('[Boolean!]!')
  })

  it('test with object', () => {
    expect(GraphQLNonNullList(new GraphQLObjectType({
      name: 'User',
      fields: {},
    }))).toEqualGraphQLType('[User!]!')
  })
})
