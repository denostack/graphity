/* eslint-disable max-classes-per-file,@typescript-eslint/no-extraneous-class */
import { GraphQLString, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLID } from 'graphql'

import { Field } from '../decorators/field'
import { GraphityEntity } from '../decorators/graphity-entity'
import { MetadataStorage } from '../metadata/MetadataStorage'
import { toGraphQLObject } from './toGraphQLObject'


describe('@graphity/schema, schema/toGraphQLObject', () => {

  beforeEach(() => {
    MetadataStorage.clearGlobalStorage()
  })

  it('test toGraphQLObject, undefined graphity entity', () => {
    class User {
    }

    expect(toGraphQLObject(User)).toEqualGraphQLType('type User')
  })

  it('test toGraphQLObject, empty class', () => {
    @GraphityEntity()
    class User {
    }

    expect(toGraphQLObject(User)).toEqualGraphQLType('type User')
  })

  it('test toGraphQLObject, full class', () => {
    @GraphityEntity()
    class User {
      @Field(GraphQLID, {
        description: 'ID Type',
      })
      id!: string

      @Field(_ => GraphQLString)
      username!: string

      @Field(_ => GraphQLString, {
        name: 'aliasLegacyName',
        deprecated: 'use other property',
      })
      legacySomething!: string

      @Field(GraphQLNonNull(GraphQLList(GraphQLNonNull(new GraphQLObjectType({
        name: 'Social',
        fields: {
          type: { type: GraphQLNonNull(GraphQLString) },
        },
      })))))
      socials!: { type: string }[]

      @Field(() => GraphQLNonNull(GraphQLList(GraphQLNonNull(new GraphQLObjectType({
        name: 'Role',
        fields: {
          name: { type: GraphQLNonNull(GraphQLString) },
        },
      })))))
      roles!: { name: string }[]
    }

    expect(toGraphQLObject(User)).toEqualGraphQLType(`type User {
      """ID Type"""
      id: ID
      username: String
      aliasLegacyName: String @deprecated(reason: "use other property")
      socials: [Social!]!
      roles: [Role!]!
    }`)
  })

  it('test toGraphQLObject, with other class', () => {
    @GraphityEntity()
    class User {
      @Field(GraphQLID)
      id!: string

      @Field(() => toGraphQLObject(Role))
      role!: Role

      @Field(() => toGraphQLObject(Role))
      otherRole!: Role
    }

    @GraphityEntity()
    class Role {
      @Field(GraphQLID)
      id!: string

      @Field(GraphQLString)
      name!: string

      @Field(() => User) // also use class!
      user!: User

      @Field(() => User) // also use class!
      firstUser!: User
    }

    expect(toGraphQLObject(User)).toEqualGraphQLType(`type User {
      id: ID
      role: Role
      otherRole: Role
    }`)

    expect(toGraphQLObject(Role)).toEqualGraphQLType(`type Role {
      id: ID
      name: String
      user: User
      firstUser: User
    }`)
  })
})
