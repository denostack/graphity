import { GithubOAuth } from "@openauth/github";
import { AuthBuilder, GraphityContext, GraphityResolver, Inject, Mutation, Query } from "graphity";
import { GraphQLNonNull, GraphQLString } from "graphql";
import { Connection, Repository } from "typeorm";

import { User } from "../entities/User";
import { AuthToken, GraphQLAuthToken } from "../types/AuthToken";

@GraphityResolver((_) => User)
export class AuthResolver {
  constructor(
    @Inject(AuthBuilder) public auth: AuthBuilder<string>,
    @Inject(GithubOAuth) public github: GithubOAuth,
    @Inject(Connection, (c) => c.getRepository(User)) public repoUsers: Repository<User>,
  ) {
  }

  @Query()
  authUser(
    _: null,
    params: null,
    ctx: GraphityContext,
  ): Promise<User | undefined> {
    const userId = ctx.$auth.user?.id;
    if (!userId) {
      return Promise.resolve(undefined);
    }
    return this.repoUsers.findOne({ id: userId });
  }

  @Query({
    returns: () => GraphQLNonNull(GraphQLString),
  })
  githubAuthRequestUri(): Promise<string> {
    return this.github.getAuthRequestUri();
  }

  @Mutation({
    input: {
      code: { type: GraphQLNonNull(GraphQLString) },
    },
    returns: (_) => GraphQLAuthToken,
  })
  async githubAuthAccessToken(_: null, params: { code: string }): Promise<AuthToken> {
    const { accessToken, expiresIn } = await this.github.getAccessTokenResponse(params.code);
    const socialUserInfo = await this.github.getAuthUser(accessToken);

    let user = await this.repoUsers.findOne({
      githubId: socialUserInfo.id,
    });

    if (!user) {
      user = await this.repoUsers.save(this.repoUsers.create({
        name: socialUserInfo.name,
        githubId: socialUserInfo.id,
        githubToken: accessToken,
      }));
    } else {
      await this.repoUsers.save(this.repoUsers.merge(user, {
        name: socialUserInfo.name,
        githubToken: accessToken,
      }));
    }

    return {
      accessToken: await this.auth.createAccessToken(user, { role: "user" }),
      refreshToken: await this.auth.createRefreshToken(user, { role: "user" }),
    };
  }
}
