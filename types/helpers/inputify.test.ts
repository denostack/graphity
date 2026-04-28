import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'

import { inputify } from './inputify'

describe('testsuite of helpers/inputify', () => {
  it('test simple', () => {
    expect(inputify(new GraphQLObjectType({
      name: 'User',
      fields: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLNonNull(GraphQLString) },
      },
    }))).toEqualGraphQLType(`
      input InputUser {
        id: ID!
        name: String!
      }
    `)
  })

  it('test recursive', () => {
    const GraphQLUser = new GraphQLObjectType({
      name: 'User',
      fields: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLNonNull(GraphQLString) },
        company: { type: new GraphQLObjectType({
          name: 'Company',
          fields: {
            id: { type: GraphQLNonNull(GraphQLID) },
            name: { type: GraphQLString },
          },
        }) },
      },
    })

    expect(inputify(GraphQLUser)).toEqualGraphQLType(`
      input InputUser {
        id: ID!
        name: String!
        company: InputCompany
      }
    `)

    expect(inputify(GraphQLUser).getFields().company.type).toEqualGraphQLType(`
      input InputCompany {
        id: ID!
        name: String
      }
    `)

    expect(inputify(GraphQLUser, { disableRecursive: true })).toEqualGraphQLType(`
      input InputUser {
        id: ID!
        name: String!
      }
    `)
  })

  it('test except', () => {
    const GraphQLUserInput = inputify(new GraphQLObjectType({
      name: 'User',
      fields: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLNonNull(GraphQLString) },
        company: { type: new GraphQLObjectType({
          name: 'Company',
          fields: {
            id: { type: GraphQLNonNull(GraphQLID) },
            name: { type: GraphQLString },
          },
        }) },
      },
    }), {
      except: ['name'],
    })

    expect(GraphQLUserInput).toEqualGraphQLType(`
      input InputUser {
        id: ID!
        company: InputCompany
      }
    `)
  })
})
