/* eslint-disable max-classes-per-file,@typescript-eslint/no-extraneous-class */
import { Field, GraphityEntity, GraphityResolver, MetadataStorage, MiddlewareCarry, MiddlewareClass, MiddlewareNext, Mutation, Query } from '@graphity/schema'
import { GraphQLNonNull, GraphQLID, GraphQLObjectType, GraphQLInt, GraphQLList, GraphQLString, GraphQLInputObjectType, execute, parse } from 'graphql'

import { Graphity } from './Graphity'


describe('graphity, foundation/Graphity', () => {

  beforeEach(() => {
    MetadataStorage.clearGlobalStorage()
  })

  it('test create GraphQL Scheme from Graphity', async () => {
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

    @GraphityResolver(returns => Article)
    class ArticleResolver {

      @Query({
        input: {
          id: { type: GraphQLNonNull(GraphQLID) },
        },
        description: 'this is article',
      })
      article(_: null, input: {id: string}) {
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
      createArticle(_: null, input: {title: string}) {
        //
      }
    }

    const graphity = new Graphity({
      resolvers: [
        ArticleResolver,
      ],
    })

    await graphity.boot()

    const schema = graphity.createSchema()

    expect(schema).toEqualGraphQLSchema(`
      """article entity"""
      type Article {
        contents: String

        """article id"""
        id: ID!
        title: String!
      }

      input InputCreateArticle {
        title: String
      }

      type Mutation {
        """this is createArticle"""
        createArticle(input: InputCreateArticle!): Article
      }

      type Query {
        """this is article"""
        article(id: ID!): Article
      }
    `)
  })

  it('test execute GraphQL Scheme from Graphity without middlewares', async () => {
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
        await new Promise(resolve => setTimeout(resolve, 50))
        return Object.assign(new Article(), {
          id: `${input.id}`,
          title: `${this.prefix}${input.id}${this.suffix}`,
        })
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
        const take = params.take || 20
        const offset = params.offset || 0
        await new Promise(resolve => setTimeout(resolve, 50))
        return {
          count: 9999,
          nodes: [...new Array(take).keys()].map(i => {
            return Object.assign(new Article(), {
              id: offset + i,
              title: `article (id=${offset + i})`,
            })
          }),
        }
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
        await new Promise(resolve => setTimeout(resolve, 50))
        return Object.assign(new Article(), {
          id: '2',
          title: input.title,
        })
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
        await new Promise(resolve => setTimeout(resolve, 50))
        return Object.assign(new Article(), {
          id: input.id,
          title: typeof input.title === 'undefined' ? `this is ${input.id} article` : input.title,
        })
      }

      @Mutation({
        input: {
          id: {
            type: GraphQLNonNull(GraphQLID),
          },
        },
      })
      async deleteArticle(_: null, input: {id: string}) {
        await new Promise(resolve => setTimeout(resolve, 50))
        return Object.assign(new Article(), {
          id: input.id,
          title: `${this.prefix}${input.id}${this.suffix}`,
        })
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
        return Object.assign(new User(), {
          id: `${input.id}`,
          name: `user${input.id} of article${parent.id}`,
        })
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
        return {
          count: 2,
          nodes: [
            Object.assign(new User(), {
              id: `${parent.id}.1`,
              name: `friend1 of ${parent.name}`,
            }),
            Object.assign(new User(), {
              id: `${parent.id}.2`,
              name: `friend2 of ${parent.name}`,
            }),
          ],
        }
      }
    }


    const graphity = new Graphity({
      resolvers: [
        ArticleResolver,
        UserResolver,
      ],
    })

    await graphity.boot()
    const schema = graphity.createSchema()

    const response1 = await execute({
      schema,
      document: parse(`query {
        article(id: "1") {
          id
          title
        }
        articles(take: 2, offset: 10) {
          count
          nodes {
            id
            title
          }
        }
      }`),
    })

    expect(response1).toEqual({
      data: {
        article: {
          id: '1',
          title: 'article (id=1)',
        },
        articles: {
          count: 9999,
          nodes: [
            {
              id: '10',
              title: 'article (id=10)',
            },
            {
              id: '11',
              title: 'article (id=11)',
            },
          ],
        },
      },
    })

    const response2 = await execute({
      schema,
      document: parse(`query {
        user(id: "1") {
          id
          name
          friends {
            count
            nodes {
              id
              name
              friends {
                count
                nodes {
                  id
                  name
                }
              }
            }
          }
        }
      }`),
      contextValue: {},
    })

    expect(response2).toEqual({
      data: {
        user: {
          id: '1',
          name: 'user1',
          friends: {
            count: 2,
            nodes: [
              {
                id: '1.1',
                name: 'friend1 of user1',
                friends: {
                  count: 2,
                  nodes: [
                    {
                      id: '1.1.1',
                      name: 'friend1 of friend1 of user1',
                    },
                    {
                      id: '1.1.2',
                      name: 'friend2 of friend1 of user1',
                    },
                  ],
                },
              },
              {
                id: '1.2',
                name: 'friend2 of user1',
                friends: {
                  count: 2,
                  nodes: [
                    {
                      id: '1.2.1',
                      name: 'friend1 of friend2 of user1',
                    },
                    {
                      id: '1.2.2',
                      name: 'friend2 of friend2 of user1',
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    })
  })

  it('test execute GraphQL Scheme from Graphity with middlewares', async () => {
    function createDetector(name: string): MiddlewareClass {
      return class {
        async handle({ parent, args, context, info }: MiddlewareCarry<any, any>, next: MiddlewareNext<any, any>) {
          await new Promise((resolve) => setTimeout(resolve, 50)) // async
          context.stack.push(`start :: ${name} (parent=${JSON.stringify(parent || null)})`)
          const result = await next({ parent, args, context, info })
          context.stack.push(`end :: ${name} (parent=${JSON.stringify(parent || null)}, next=${JSON.stringify(result)})`)
          return result
        }
      }
    }

    @GraphityEntity()
    class Comment {
      @Field(type => GraphQLNonNull(GraphQLID), {
        middlewares: [
          createDetector('field / user.id ... 1'),
          createDetector('field / user.id ... 2'),
        ],
      })
      id!: string
    }

    @GraphityResolver(returns => Comment, {
      middlewares: [
        createDetector('resolver ... 1'),
        createDetector('resolver ... 2'),
      ],
    })
    class CommentResolver {
      @Query({
        input: {
          id: { type: GraphQLNonNull(GraphQLID) },
        },
        middlewares: createDetector('resolver / comment'),
      })
      comment(_: null, input: {id: string}) {
        return Object.assign(new Comment(), {
          id: `${input.id}`,
        })
      }

      @Query({
        parent: type => Comment,
        middlewares: [
          createDetector('resolver / comments ... 1'),
          createDetector('resolver / comments ... 2'),
        ],
        returns: node => GraphQLNonNull(new GraphQLObjectType({
          name: 'ListOfComments',
          fields: {
            count: { type: GraphQLNonNull(GraphQLInt) },
            nodes: { type: GraphQLNonNull(GraphQLList(GraphQLNonNull(node))) },
          },
        })),
      })
      comments(parent: Comment) {
        return {
          count: 2,
          nodes: [
            Object.assign(new Comment(), {
              id: `${parent.id}.1`,
            }),
            Object.assign(new Comment(), {
              id: `${parent.id}.2`,
            }),
          ],
        }
      }
    }

    const app = new Graphity({
      rootMiddlewares: [
        createDetector('root'),
      ],
      queryMiddlewares: [
        createDetector('query'),
      ],
      mutationMiddlewares: [
        createDetector('mutation'),
      ],
      resolvers: [
        CommentResolver,
      ],
    })

    await app.boot()

    const schema = app.createSchema()

    const ctx: { $: true, stack: string[] } = { $: true, stack: [] }
    const response = await execute({
      schema,
      document: parse(`query {
        comment(id: "1") {
          id
          comments {
            nodes {
              id
              comments {
                count
                nodes {
                  id
                }
              }
            }
          }
        }
      }`),
      contextValue: ctx,
    })

    expect(response).toEqual({
      data: {
        comment: {
          id: '1',
          comments: {
            nodes: [
              {
                comments: {
                  count: 2,
                  nodes: [
                    {
                      id: '1.1.1',
                    },
                    {
                      id: '1.1.2',
                    },
                  ],
                },
                id: '1.1',
              },
              {
                comments: {
                  count: 2,
                  nodes: [
                    {
                      id: '1.2.1',
                    },
                    {
                      id: '1.2.2',
                    },
                  ],
                },
                id: '1.2',
              },
            ],
          },
        },
      },
    })

    expect(ctx.$).toBe(true)

    expect(ctx.stack.length).toEqual(62)
    expect([...new Set(ctx.stack)].length).toEqual(62)

    const serials = [
      [
        'start :: root (parent=null)',
        'start :: query (parent=null)',
        'start :: resolver ... 1 (parent=null)',
        'start :: resolver ... 2 (parent=null)',
        'start :: resolver / comment (parent=null)',
        'end :: resolver / comment (parent=null, next={"id":"1"})',
        'end :: resolver ... 2 (parent=null, next={"id":"1"})',
        'end :: resolver ... 1 (parent=null, next={"id":"1"})',
        'end :: query (parent=null, next={"id":"1"})',
        'end :: root (parent=null, next={"id":"1"})',
      ],
      [
        'start :: field / user.id ... 1 (parent={"id":"1"})',
        'start :: field / user.id ... 2 (parent={"id":"1"})',
        'end :: field / user.id ... 2 (parent={"id":"1"}, next="1")',
        'end :: field / user.id ... 1 (parent={"id":"1"}, next="1")',
      ],
      [
        'start :: resolver ... 1 (parent={"id":"1"})',
        'start :: resolver ... 2 (parent={"id":"1"})',
        'start :: resolver / comments ... 1 (parent={"id":"1"})',
        'start :: resolver / comments ... 2 (parent={"id":"1"})',
        'end :: resolver / comments ... 2 (parent={"id":"1"}, next={"count":2,"nodes":[{"id":"1.1"},{"id":"1.2"}]})',
        'end :: resolver / comments ... 1 (parent={"id":"1"}, next={"count":2,"nodes":[{"id":"1.1"},{"id":"1.2"}]})',
        'end :: resolver ... 2 (parent={"id":"1"}, next={"count":2,"nodes":[{"id":"1.1"},{"id":"1.2"}]})',
        'end :: resolver ... 1 (parent={"id":"1"}, next={"count":2,"nodes":[{"id":"1.1"},{"id":"1.2"}]})',
      ],
      [
        'start :: field / user.id ... 1 (parent={"id":"1.1"})',
        'start :: field / user.id ... 2 (parent={"id":"1.1"})',
        'end :: field / user.id ... 2 (parent={"id":"1.1"}, next="1.1")',
        'end :: field / user.id ... 1 (parent={"id":"1.1"}, next="1.1")',
      ],
      [
        'start :: resolver ... 1 (parent={"id":"1.1"})',
        'start :: resolver ... 2 (parent={"id":"1.1"})',
        'start :: resolver / comments ... 1 (parent={"id":"1.1"})',
        'start :: resolver / comments ... 2 (parent={"id":"1.1"})',
        'end :: resolver / comments ... 2 (parent={"id":"1.1"}, next={"count":2,"nodes":[{"id":"1.1.1"},{"id":"1.1.2"}]})',
        'end :: resolver / comments ... 1 (parent={"id":"1.1"}, next={"count":2,"nodes":[{"id":"1.1.1"},{"id":"1.1.2"}]})',
        'end :: resolver ... 2 (parent={"id":"1.1"}, next={"count":2,"nodes":[{"id":"1.1.1"},{"id":"1.1.2"}]})',
        'end :: resolver ... 1 (parent={"id":"1.1"}, next={"count":2,"nodes":[{"id":"1.1.1"},{"id":"1.1.2"}]})',
      ],
      [
        'start :: field / user.id ... 1 (parent={"id":"1.2"})',
        'start :: field / user.id ... 2 (parent={"id":"1.2"})',
        'end :: field / user.id ... 2 (parent={"id":"1.2"}, next="1.2")',
        'end :: field / user.id ... 1 (parent={"id":"1.2"}, next="1.2")',
      ],
      [
        'start :: resolver ... 1 (parent={"id":"1.2"})',
        'start :: resolver ... 2 (parent={"id":"1.2"})',
        'start :: resolver / comments ... 1 (parent={"id":"1.2"})',
        'start :: resolver / comments ... 2 (parent={"id":"1.2"})',
        'end :: resolver / comments ... 2 (parent={"id":"1.2"}, next={"count":2,"nodes":[{"id":"1.2.1"},{"id":"1.2.2"}]})',
        'end :: resolver / comments ... 1 (parent={"id":"1.2"}, next={"count":2,"nodes":[{"id":"1.2.1"},{"id":"1.2.2"}]})',
        'end :: resolver ... 2 (parent={"id":"1.2"}, next={"count":2,"nodes":[{"id":"1.2.1"},{"id":"1.2.2"}]})',
        'end :: resolver ... 1 (parent={"id":"1.2"}, next={"count":2,"nodes":[{"id":"1.2.1"},{"id":"1.2.2"}]})',
      ],
      [
        'start :: field / user.id ... 1 (parent={"id":"1.1.1"})',
        'start :: field / user.id ... 2 (parent={"id":"1.1.1"})',
        'end :: field / user.id ... 2 (parent={"id":"1.1.1"}, next="1.1.1")',
        'end :: field / user.id ... 1 (parent={"id":"1.1.1"}, next="1.1.1")',
      ],
      [
        'start :: field / user.id ... 1 (parent={"id":"1.1.2"})',
        'start :: field / user.id ... 2 (parent={"id":"1.1.2"})',
        'end :: field / user.id ... 2 (parent={"id":"1.1.2"}, next="1.1.2")',
        'end :: field / user.id ... 1 (parent={"id":"1.1.2"}, next="1.1.2")',
      ],
      [
        'start :: field / user.id ... 1 (parent={"id":"1.2.1"})',
        'start :: field / user.id ... 2 (parent={"id":"1.2.1"})',
        'end :: field / user.id ... 2 (parent={"id":"1.2.1"}, next="1.2.1")',
        'end :: field / user.id ... 1 (parent={"id":"1.2.1"}, next="1.2.1")',
      ],
      [
        'start :: field / user.id ... 1 (parent={"id":"1.2.2"})',
        'start :: field / user.id ... 2 (parent={"id":"1.2.2"})',
        'end :: field / user.id ... 2 (parent={"id":"1.2.2"}, next="1.2.2")',
        'end :: field / user.id ... 1 (parent={"id":"1.2.2"}, next="1.2.2")',
      ],
    ]

    let counter = 0
    for (const serial of serials) {
      let index = -1
      for (const line of serial) {
        const foundIndex = ctx.stack.indexOf(line)
        if (foundIndex === -1) {
          throw new Error(`line(${line}) not found`)
        }
        if (foundIndex < index) {
          throw new Error(`line$(${line}) is not sequential`)
        }
        index = foundIndex
        counter++
      }
    }
    expect(counter).toEqual(62)
  })
})
