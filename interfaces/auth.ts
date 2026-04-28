
export interface UserIdentifier {
  id: string | number
}

export interface GraphityAuth<TUser extends UserIdentifier = UserIdentifier, TRole extends string = string> {
  user?: TUser
  roles: TRole[]
}

export interface CreateTokenOptions<TRole extends string> {
  expiresIn?: number
  role?: TRole | TRole[]
}

/**
 * It was an Interface, but it was defined as a class for use in DI container.
 */
export class AuthBuilder<TUser extends UserIdentifier = UserIdentifier, TRole extends string = string> {
  createAccessToken(user: UserIdentifier, options?: CreateTokenOptions<TRole>): Promise<string> {
    throw new Error('It must be implemented.')
  }

  createRefreshToken(user: UserIdentifier, options?: CreateTokenOptions<TRole>): Promise<string> {
    throw new Error('It must be implemented.')
  }

  showRefreshToken(refreshToken: string): Promise<{ user: UserIdentifier, role?: TRole | TRole[] }> {
    throw new Error('It must be implemented.')
  }

  buildAuth(accessToken?: string | null): Promise<GraphityAuth<TUser, TRole>> {
    throw new Error('It must be implemented.')
  }
}
