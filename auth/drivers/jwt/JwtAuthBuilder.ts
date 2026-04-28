import { JsonWebTokenError, Secret, sign, SignOptions, verify, VerifyOptions } from 'jsonwebtoken'

import { GraphityAuth, UserIdentifier, AuthBuilder, CreateTokenOptions } from '../../../interfaces/auth'
import { JwtOptions } from './interfaces'

export interface JwtAuthBuilderOptions {
  security: JwtOptions
  accessToken?: SignOptions
  refreshToken?: SignOptions
}

interface TokenPayload<TRole extends string> extends UserIdentifier {
  aud: string
  exp: number
  iat: number
  role?: TRole | TRole[]
}

export class JwtAuthBuilder<TUser extends UserIdentifier = UserIdentifier, TRole extends string = string> extends AuthBuilder<TUser, TRole> {

  constructor(
    public options: JwtAuthBuilderOptions,
  ) {
    super()
  }

  createAccessToken(user: UserIdentifier, { role, ...options }: CreateTokenOptions<TRole> = {}): Promise<string> {
    const signOption: SignOptions = Object.entries({
      expiresIn: '7d',
      audience: 'app',
      ...this.options.accessToken,
      ...options,
    }).filter(([_, value]) => value !== null && value !== undefined)
      .reduce((carry, [key, value]) => Object.assign(carry, { [key]: value }), {})
    return Promise.resolve(this._sign({ ...user, role }, signOption))
  }

  createRefreshToken(user: UserIdentifier, { role, ...options }: CreateTokenOptions<TRole> = {}): Promise<string> {
    return Promise.resolve(this._sign({ ...user, role }, {
      expiresIn: '7d',
      audience: 'refresh',
      ...this.options.refreshToken,
      ...options,
    }))
  }

  showRefreshToken(refreshToken: string): Promise<{ user: TUser, role?: TRole | TRole[] }> {
    try {
      const { role, aud, iat, exp, ...user } = this._verify<TokenPayload<TRole>>(refreshToken, {
        audience: this.options.refreshToken?.audience ?? 'refresh',
      })
      return Promise.resolve({ user: user as TUser, role })
    } catch (e) {
      return Promise.reject(e)
    }
  }

  buildAuth(accessToken?: string | null): Promise<GraphityAuth<TUser, TRole>> {
    if (!accessToken) {
      return Promise.resolve({
        roles: [],
      })
    }
    try {
      const { role, aud, iat, exp, ...user } = this._verify<TokenPayload<TRole>>(accessToken, {
        audience: this.options.accessToken?.audience ?? 'app',
      })
      return Promise.resolve({
        user: user as TUser,
        roles: role && (Array.isArray(role) ? role : [role]) || [],
      })
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        //
      } else {
        console.log('error', e)
      }
    }
    return Promise.resolve({
      roles: [],
    })
  }

  _sign(payload: any, options: SignOptions = {}): string {
    let secretOrPrivKey: Secret = ''
    switch (this.options.security.algorithm) {
      case 'HS256':
      case 'HS384':
      case 'HS512':
        secretOrPrivKey = this.options.security.secret
        break
      case 'RS256':
      case 'RS384':
      case 'RS512':
        secretOrPrivKey = this.options.security.privateKey
        break
    }
    return sign(payload, secretOrPrivKey, {
      algorithm: this.options.security.algorithm,
      ...options,
    })
  }

  _verify<T>(token: string, options?: VerifyOptions): T {
    let secretOrPubKey: string | Buffer = ''
    switch (this.options.security.algorithm) {
      case 'HS256':
      case 'HS384':
      case 'HS512':
        secretOrPubKey = this.options.security.secret
        break
      case 'RS256':
      case 'RS384':
      case 'RS512':
        secretOrPubKey = this.options.security.publicKey
        break
    }
    return verify(token, secretOrPubKey, {
      algorithms: [this.options.security.algorithm],
      ...options,
    }) as any as T
  }
}
