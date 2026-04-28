/* eslint-disable max-classes-per-file,@typescript-eslint/no-extraneous-class */
import { GraphQLNonNull, GraphQLID, GraphQLObjectType, GraphQLInt, GraphQLList, GraphQLString, GraphQLInputObjectType, GraphQLUnionType, GraphQLInterfaceType } from 'graphql'

import { Field } from '../decorators/field'
import { GraphityEntity } from '../decorators/graphity-entity'
import { GraphityResolver } from '../decorators/graphity-resolver'
import { Mutation } from '../decorators/mutation'
import { Query } from '../decorators/query'
import { MiddlewareCarry, MiddlewareClass, MiddlewareNext } from '../interfaces/middleware'
import { MetadataStorage } from '../metadata/MetadataStorage'
import { createGraphQLSchema } from './createGraphQLSchema'
import { toGraphQLObject } from './toGraphQLObject'


describe('@graphity/schema, schema/createGraphQLSchema', () => {

  beforeEach(() => {
    MetadataStorage.clearGlobalStorage()
  })

  it('test createGraphQLSchema, empty', async () => {
    const schema = createGraphQLSchema({
      resolvers: [],
    })

    expect(schema).toEqualGraphQLSchema('')
  })

  it('test createGraphQLSchema, only query', async () => {
    @GraphityEntity()
    class User {
      @Field(GraphQLNonNull(GraphQLID))
      id!: string
    }

    @GraphityResolver(() => User)
    class UserResolver {
      @Query()
      user() {
        //
      }
    }

    const schema = createGraphQLSchema({
      resolvers: [
        UserResolver,
      ],
    })

    expect(schema).toEqualGraphQLSchema(`
      type Query {
        user: User
      }

      type User {
        id: ID!
      }
    `)
  })

  it('test createGraphQLSchema, only mutation', async () => {
    @GraphityEntity()
    class User {
      @Field(GraphQLNonNull(GraphQLID))
      id!: string
    }

    @GraphityResolver(() => User)
    class UserResolver {
      @Mutation()
      createUser() {
        //
      }
    }


    const schema = createGraphQLSchema({
      resolvers: [
        UserResolver,
      ],
    })

    expect(schema).toEqualGraphQLSchema(`
      type Mutation {
        createUser: User
      }

      type User {
        id: ID!
      }
    `)
  })

  it('test createGraphQLSchema, all', async () => {
    @GraphityEntity({
      description: 'article entity',
    })
    class Article {
      @Field(type => GraphQLNonNull(GraphQLID), {
        description: 'article id',
      })
      id!: string

      @Field(type => GraphQLNonNull(GraphQLString))
      title!: string

      @Field(type => GraphQLString)
      contents?: string | null
    }

    @GraphityEntity()
    class User {
      @Field(type => GraphQLNonNull(GraphQLID))
      id!: string

      @Field(type => GraphQLNonNull(GraphQLString))
      name!: string
    }


    @GraphityResolver(returns => Article)
    class ArticleResolver {

      prefix = 'article (id='
      suffix = ')'

      @Query({
        input: {
          id: { type: GraphQLNonNull(GraphQLID) },
        },
        description: 'this is article',
      })
      async article(_: null, input: {id: string}) {
        //
      }

      @Query({
        returns: node => new GraphQLObjectType({
          name: 'ListOfArticles',
          fields: {
            count: { type: GraphQLNonNull(GraphQLInt) },
            nodes: { type: GraphQLNonNull(GraphQLList(GraphQLNonNull(node))) },
          },
        }),
        input: {
          take: { type: GraphQLInt },
          offset: { type: GraphQLInt },
        },
      })
      async articles(_: null, params: { take?: number, offset?: number }) {
        //
      }

      @Mutation({
        input: {
          input: { type: GraphQLNonNull(new GraphQLInputObjectType({
            name: 'InputCreateArticle',
            fields: {
              title: { type: GraphQLString },
            },
          })) },
        },
        description: 'this is createArticle',
      })
      async createArticle(_: null, input: {title: string}) {
        //
      }

      @Mutation({
        input: {
          id: { type: GraphQLNonNull(GraphQLID) },
          input: { type: GraphQLNonNull(new GraphQLInputObjectType({
            name: 'InputUpdateArticle',
            fields: {
              title: { type: GraphQLString },
            },
          })) },
        },
      })
      async updateArticle(_: null, input: {id: string, title?: string | null}) {
        //
      }

      @Mutation({
        input: {
          id: {
            type: GraphQLNonNull(GraphQLID),
          },
        },
      })
      async deleteArticle(_: null, input: {id: string}) {
        //
      }
    }

    @GraphityResolver(returns => User)
    class UserResolver {

      @Query({
        input: {
          id: { type: GraphQLNonNull(GraphQLID) },
        },
      })
      user(parent: null, input: {id: string}) {
        return Object.assign(new User(), {
          id: `${input.id}`,
          name: `user${input.id}`,
        })
      }

      @Query({
        parent: () => Article,
        name: 'user',
      })
      userFromArticle(parent: Article, input: {id: string}) {
        //
      }

      @Query({
        parent: type => User,
        returns: node => GraphQLNonNull(new GraphQLObjectType({
          name: 'ListOfFriends',
          fields: {
            count: { type: GraphQLNonNull(GraphQLInt) },
            nodes: { type: GraphQLNonNull(GraphQLList(GraphQLNonNull(node))) },
          },
        })),
      })
      friends(parent: User) {
        //
      }
    }


    const schema = createGraphQLSchema({
      resolvers: [
        ArticleResolver,
        UserResolver,
      ],
    })

    // schema.
    expect(schema).toEqualGraphQLSchema(`
      """article entity"""
      type Article {
        contents: String

        """article id"""
        id: ID!
        title: String!
        user: User
      }

      input InputCreateArticle {
        title: String
      }

      input InputUpdateArticle {
        title: String
      }

      type ListOfArticles {
        count: Int!
        nodes: [Article!]!
      }

      type ListOfFriends {
        count: Int!
        nodes: [User!]!
      }

      type Mutation {
        """this is createArticle"""
        createArticle(input: InputCreateArticle!): Article
        deleteArticle(id: ID!): Article
        updateArticle(id: ID!, input: InputUpdateArticle!): Article
      }

      type Query {
        """this is article"""
        article(id: ID!): Article
        articles(offset: Int, take: Int): ListOfArticles
        user(id: ID!): User
      }

      type User {
        friends: ListOfFriends!
        id: ID!
        name: String!
      }
    `)
  })

  it('test createSchema middlewares', async () => {
    function createAnonymousMiddleware(name: string): MiddlewareClass {
      return class {
        static middleware = name
        handle({ parent, args, context, info }: MiddlewareCarry<any, any>, next: MiddlewareNext<any, any>) {
          return next()
        }
      }
    }

    @GraphityEntity()
    class Comment {
      @Field(type => GraphQLNonNull(GraphQLID))
      id!: string

      @Field(type => GraphQLNonNull(GraphQLString), {
        middlewares: [
          createAnonymousMiddleware('Comment.name 1'),
          createAnonymousMiddleware('Comment.name 2'),
        ],
      })
      name!: string

      @Field(type => GraphQLNonNull(GraphQLInt), {
        resolve: () => 30,
      })
      age!: string
    }

    @GraphityResolver(returns => Comment, {
      middlewares: [
        createAnonymousMiddleware('Comment 1'),
        createAnonymousMiddleware('Comment 2'),
      ],
    })
    class CommentResolver {
      @Query({
        input: {
          id: { type: GraphQLNonNull(GraphQLID) },
        },
        middlewares: createAnonymousMiddleware('Query.comment 1'),
      })
      comment() {
        //
      }

      @Query({
        parent: type => Comment,
        middlewares: [
          createAnonymousMiddleware('Comment.comments 1'),
          createAnonymousMiddleware('Comment.comments 2'),
        ],
        returns: node => GraphQLNonNull(new GraphQLObjectType({
          name: 'ListOfComments',
          fields: {
            count: { type: GraphQLNonNull(GraphQLInt) },
            nodes: { type: GraphQLNonNull(GraphQLList(GraphQLNonNull(node))) },
          },
        })),
      })
      comments() {
        //
      }

      @Mutation({
        input: { id: { type: GraphQLNonNull(GraphQLID) } },
      })
      createComment() {
        //
      }

      @Mutation({
        input: { id: { type: GraphQLNonNull(GraphQLID) } },
        middlewares: [
          createAnonymousMiddleware('Mut.deleteComment 1'),
          createAnonymousMiddleware('Mut.deleteComment 2'),
        ],
      })
      deleteComment() {
        //
      }
    }

    const schema = createGraphQLSchema({
      rootMiddlewares: [
        createAnonymousMiddleware('Root 1'),
        createAnonymousMiddleware('Root 2'),
      ],
      queryMiddlewares: [
        createAnonymousMiddleware('Qry 1'),
        createAnonymousMiddleware('Qry 2'),
      ],
      mutationMiddlewares: [
        createAnonymousMiddleware('Mut 1'),
        createAnonymousMiddleware('Mut 2'),
      ],
      subscriptionMiddlewares: [
        createAnonymousMiddleware('Sub 1'),
        createAnonymousMiddleware('Sub 2'),
      ],
      resolvers: [
        CommentResolver,
      ],
    })

    const storage = MetadataStorage.getGlobalStorage()

    expect(storage.findGraphQLFieldResolves(schema.getQueryType()!)).toEqual([
      {
        name: 'comment',
        middlewares: [
          expect.objectContaining({ middleware: 'Root 1' }),
          expect.objectContaining({ middleware: 'Root 2' }),
          expect.objectContaining({ middleware: 'Qry 1' }),
          expect.objectContaining({ middleware: 'Qry 2' }),
          expect.objectContaining({ middleware: 'Comment 1' }),
          expect.objectContaining({ middleware: 'Comment 2' }),
          expect.objectContaining({ middleware: 'Query.comment 1' }),
        ],
        resolver: CommentResolver,
        resolve: CommentResolver.prototype.comment,
      },
    ])

    expect(storage.findGraphQLFieldResolves(schema.getMutationType()!)).toEqual([
      {
        name: 'createComment',
        middlewares: [
          expect.objectContaining({ middleware: 'Root 1' }),
          expect.objectContaining({ middleware: 'Root 2' }),
          expect.objectContaining({ middleware: 'Mut 1' }),
          expect.objectContaining({ middleware: 'Mut 2' }),
          expect.objectContaining({ middleware: 'Comment 1' }),
          expect.objectContaining({ middleware: 'Comment 2' }),
        ],
        resolver: CommentResolver,
        resolve: CommentResolver.prototype.createComment,
      },
      {
        name: 'deleteComment',
        middlewares: [
          expect.objectContaining({ middleware: 'Root 1' }),
          expect.objectContaining({ middleware: 'Root 2' }),
          expect.objectContaining({ middleware: 'Mut 1' }),
          expect.objectContaining({ middleware: 'Mut 2' }),
          expect.objectContaining({ middleware: 'Comment 1' }),
          expect.objectContaining({ middleware: 'Comment 2' }),
          expect.objectContaining({ middleware: 'Mut.deleteComment 1' }),
          expect.objectContaining({ middleware: 'Mut.deleteComment 2' }),
        ],
        resolver: CommentResolver,
        resolve: CommentResolver.prototype.deleteComment,
      },
    ])

    expect(storage.findGraphQLFieldResolves(schema.getType('Comment') as any)).toEqual([
      {
        name: 'id',
        middlewares: [
        ],
        resolve: null,
      },
      {
        name: 'name',
        middlewares: [
          expect.objectContaining({ middleware: 'Comment.name 1' }),
          expect.objectContaining({ middleware: 'Comment.name 2' }),
        ],
        resolve: null,
      },
      {
        name: 'age',
        middlewares: [],
        resolve: expect.any(Function),
      },
      {
        name: 'comments',
        middlewares: [
          expect.objectContaining({ middleware: 'Comment 1' }),
          expect.objectContaining({ middleware: 'Comment 2' }),
          expect.objectContaining({ middleware: 'Comment.comments 1' }),
          expect.objectContaining({ middleware: 'Comment.comments 2' }),
        ],
        resolver: CommentResolver,
        resolve: CommentResolver.prototype.comments,
      },
    ])
  })

  it('test createGraphQLSchema, union', async () => {
    @GraphityEntity()
    class Movie {
      @Field(GraphQLNonNull(GraphQLID))
      id!: string
    }

    @GraphityEntity()
    class Actor {
      @Field(GraphQLNonNull(GraphQLID))
      id!: string
    }

    @GraphityResolver(() => new GraphQLUnionType({
      name: 'Result',
      types: [
        toGraphQLObject(Movie),
        toGraphQLObject(Actor),
      ],
      resolveType: (value) => {
        if (value instanceof Movie) {
          return toGraphQLObject(Movie)
        }
        return toGraphQLObject(Actor)
      },
    }))
    class ResultResolver {
      @Query({
        returns: node => GraphQLNonNull(GraphQLList(GraphQLNonNull(node))),
      })
      resultPagination() {
        //
      }
    }


    const schema = createGraphQLSchema({
      resolvers: [
        ResultResolver,
      ],
    })

    expect(schema).toEqualGraphQLSchema(`
      type Actor {
        id: ID!
      }

      type Movie {
        id: ID!
      }

      type Query {
        resultPagination: [Result!]!
      }

      union Result = Actor | Movie
    `)

    const storage = MetadataStorage.getGlobalStorage()

    expect(storage.findGraphQLFieldResolves(schema.getQueryType()!)).toEqual([
      {
        name: 'resultPagination',
        middlewares: [
        ],
        resolver: ResultResolver,
        resolve: ResultResolver.prototype.resultPagination,
      },
    ])

  })

  it('test createGraphQLSchema, interface', async () => {

    const GraphQLResult = new GraphQLInterfaceType({
      name: 'Result',
      fields: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
    })

    interface Result {
      id: string
    }

    @GraphityEntity({
      implements: GraphQLResult,
    })
    class Movie implements Result {
      @Field(GraphQLNonNull(GraphQLID))
      id!: string
    }

    @GraphityEntity({
      implements: GraphQLResult,
    })
    class Actor implements Result {
      @Field(GraphQLNonNull(GraphQLID))
      id!: string
    }

    @GraphityResolver(() => GraphQLResult)
    class ResultResolver {
      @Query({
        returns: node => GraphQLNonNull(GraphQLList(GraphQLNonNull(node))),
      })
      resultPagination() {
        //
      }
    }


    const schema = createGraphQLSchema({
      resolvers: [
        ResultResolver,
      ],
      entities: [
        Movie,
        Actor,
      ],
    })

    expect(schema).toEqualGraphQLSchema(`
      type Actor implements Result {
        id: ID!
      }

      type Movie implements Result {
        id: ID!
      }

      type Query {
        resultPagination: [Result!]!
      }

      interface Result {
        id: ID!
      }
    `)

    const storage = MetadataStorage.getGlobalStorage()

    expect(storage.findGraphQLFieldResolves(schema.getQueryType()!)).toEqual([
      {
        name: 'resultPagination',
        middlewares: [
        ],
        resolver: ResultResolver,
        resolve: ResultResolver.prototype.resultPagination,
      },
    ])
  })

})
