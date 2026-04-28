import 'jest'

import { GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString, parse } from 'graphql'

import { GraphQLExecutor } from './graphql-executor'

const GraphQLArticle = new GraphQLObjectType({
  name: 'Article',
  fields: {
    id: { type: GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLNonNull(GraphQLString) },
  },
})

const GraphQLSocial = new GraphQLObjectType({
  name: 'Social',
  fields: {
    id: { type: GraphQLNonNull(GraphQLID) },
    type: { type: GraphQLNonNull(GraphQLString) },
  },
})

const GraphQLUser = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLNonNull(GraphQLString) },
    socials: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLSocial))),
      resolve() {
        return [
          { id: 1, type: 'facebook' },
          { id: 2, type: 'twitter' },
        ]
      },
    },
    articles: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLArticle))),
      args: {
        take: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve(_, args) {
        const take = args.take || 3
        const articles = []
        for (let i = 0; i < take; i++) {
          const id = i + 1
          articles.push({ id, title: `title of ${id}` })
        }
        return articles
      },
    },
  },
})

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      users: {
        type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLUser))),
        args: {
          take: { type: GraphQLInt },
          skip: { type: GraphQLInt },
        },
        resolve(_, args) {
          const take = args.take || 3
          const users = []
          for (let i = 0; i < take; i++) {
            const id = i + 1 + (args.skip || 0)
            users.push({ id, name: `corgidisco${id}` })
          }
          return users
        },
      },
    },
  }),
})

describe('testsuite of restful/create-handler', () => {
  const executor = new GraphQLExecutor({ schema })
  it('test query', async () => {
    expect(await executor.execute(parse('query{users{id name}}'))).toEqual({
      users: [
        { id: '1', name: 'corgidisco1' },
        { id: '2', name: 'corgidisco2' },
        { id: '3', name: 'corgidisco3' },
      ],
    })
  })
})
