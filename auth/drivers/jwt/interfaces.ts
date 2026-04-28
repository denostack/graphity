import { Secret } from 'jsonwebtoken'

export type JwtAlgorithm = 'HS256'
| 'HS384'
| 'HS512'
| 'RS256'
| 'RS384'
| 'RS512'
| 'PS256'
| 'PS384'
| 'PS512'
| 'ES256'
| 'ES384'
| 'ES512'
| 'none'


export type JwtOptions = JwtHashOptions | JwtRsaOptions

export interface JwtHashOptions {
  algorithm: 'HS256' | 'HS384' | 'HS512'
  secret: string
}

export interface JwtRsaOptions {
  algorithm: 'RS256' | 'RS384' | 'RS512'
  privateKey: Secret
  publicKey: string | Buffer
}
