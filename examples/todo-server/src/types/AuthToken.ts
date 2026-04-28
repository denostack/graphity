import { GraphQLObject } from "graphity";
import { GraphQLNonNull, GraphQLString } from "graphql";

export interface AuthToken {
  accessToken: string;
  refreshToken: string | null;
}

export const GraphQLAuthToken = GraphQLObject({
  name: "AuthToken",
  fields: {
    accessToken: GraphQLNonNull(GraphQLString),
    refreshToken: GraphQLString,
  },
});
