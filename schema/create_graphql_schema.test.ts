import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { GraphQLID } from "graphql";

import "../_test_helpers.ts";

import { field } from "../decorators/field.ts";
import { mutation } from "../decorators/mutation.ts";
import { objectType } from "../decorators/object_type.ts";
import { query } from "../decorators/query.ts";
import { resolver } from "../decorators/resolver.ts";
import { createGraphQLSchema } from "./create_graphql_schema.ts";

describe("createGraphQLSchema", () => {
  it("returns empty schema when no resolvers are given", () => {
    const schema = createGraphQLSchema({
      resolvers: [],
    });

    expect(schema).toEqualGraphQLSchema("");
  });

  it("builds schema with queries", () => {
    @objectType()
    class User {
      @field(() => GraphQLID)
      id!: string;
    }

    @resolver()
    class UserResolver {
      @query(() => User)
      user() {
        //
      }
    }

    const schema = createGraphQLSchema({
      resolvers: [
        UserResolver,
      ],
    });

    expect(schema).toEqualGraphQLSchema(`
      type Query {
        user: User!
      }

      type User {
        id: ID!
      }
    `);
  });

  it("builds schema with mutations", () => {
    @objectType()
    class User {
      @field(() => GraphQLID)
      id!: string;
    }

    @resolver()
    class UserResolver {
      @mutation(() => User, { nullable: true })
      createUser() {
        //
      }
    }

    const schema = createGraphQLSchema({
      resolvers: [
        UserResolver,
      ],
    });

    expect(schema).toEqualGraphQLSchema(`
      type Mutation {
        createUser: User
      }

      type User {
        id: ID!
      }
    `);
  });
});
