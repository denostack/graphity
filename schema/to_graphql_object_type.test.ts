import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { GraphQLID, GraphQLString } from "graphql";

import "../_test_helpers.ts";

import { field } from "../decorators/field.ts";
import { objectType } from "../decorators/object_type.ts";
import { toGraphQLObjectType } from "./to_graphql_object_type.ts";

describe("toGraphQLObjectType", () => {
  it("throws when @objectType decorator is missing", () => {
    class User {
    }

    expect(() => toGraphQLObjectType(User)).toThrow(/@objectType/);
  });

  it("creates empty type from @objectType class with no fields", () => {
    @objectType()
    class User {
    }

    expect(toGraphQLObjectType(User)).toEqualGraphQLType("type User");
  });

  it("resolves entity references between classes", () => {
    @objectType()
    class User {
      @field(() => GraphQLID)
      id!: string;

      @field(() => Role)
      role!: Role;

      @field(() => Role)
      otherRole!: Role;
    }

    @objectType()
    class Role {
      @field(() => GraphQLID)
      id!: string;

      @field(() => GraphQLString)
      name!: string;

      @field(() => User)
      user!: User;

      @field(() => User)
      firstUser!: User;
    }

    expect(toGraphQLObjectType(User)).toEqualGraphQLType(`type User {
      id: ID!
      role: Role!
      otherRole: Role!
    }`);

    expect(toGraphQLObjectType(Role)).toEqualGraphQLType(`type Role {
      id: ID!
      name: String!
      user: User!
      firstUser: User!
    }`);
  });
});
