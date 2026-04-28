/* eslint-disable max-classes-per-file,@typescript-eslint/no-extraneous-class */
import { readFileSync } from 'fs'
import { decode, verify, JsonWebTokenError } from 'jsonwebtoken'

import { JwtAuthBuilder } from './JwtAuthBuilder'

describe('graphity, auth/drivers/jwt/JwtAuthBuilder', () => {
  const HS256_SECRET = 'JWT_SECRET'
  const RS256_PRIVATE = readFileSync(`${__dirname}/RS256.key`)
  const RS256_PUBLIC = readFileSync(`${__dirname}/RS256.key.pub`)

  const appAuth = new JwtAuthBuilder({
    security: {
      algorithm: 'HS256',
      secret: HS256_SECRET,
    },
  })
  const graphityAuth = new JwtAuthBuilder({
    security: {
      algorithm: 'RS256',
      privateKey: RS256_PRIVATE,
      publicKey: RS256_PUBLIC,
    },
    accessToken: {
      audience: 'graphity-access',
    },
    refreshToken: {
      audience: 'graphity-refresh',
    },
  })

  it('test createAccessToekn success', async () => {
    expect(verify(await appAuth.createAccessToken({ id: 1 }), HS256_SECRET)).toEqual({
      id: 1,
      aud: 'app',
      iat: expect.any(Number),
      exp: expect.any(Number),
    })

    expect(verify(await appAuth.createAccessToken({ id: 1, username: 'wan2land' } as any), HS256_SECRET)).toEqual({
      id: 1,
      username: 'wan2land',
      aud: 'app',
      iat: expect.any(Number),
      exp: expect.any(Number),
    })

    expect(verify(await graphityAuth.createAccessToken({ id: 1 }), RS256_PUBLIC)).toEqual({
      id: 1,
      aud: 'graphity-access',
      iat: expect.any(Number),
      exp: expect.any(Number),
    })

    expect(verify(await appAuth.createAccessToken({ id: 1 }, { role: 'user' }), HS256_SECRET)).toEqual({
      id: 1,
      role: 'user',
      aud: 'app',
      iat: expect.any(Number),
      exp: expect.any(Number),
    })

    expect(verify(await appAuth.createAccessToken({ id: 1 }, { role: ['user', 'manager'] }), HS256_SECRET)).toEqual({
      id: 1,
      role: ['user', 'manager'],
      aud: 'app',
      iat: expect.any(Number),
      exp: expect.any(Number),
    })
  })

  it('test createAccessToekn fail', async () => {
    const accessToken = await appAuth.createAccessToken({ id: 1 }, { expiresIn: 0 })
    expect(() => verify(accessToken, HS256_SECRET)).toThrowError('jwt expired')
  })

  it('test createRefreshToken success', async () => {
    expect(verify(await appAuth.createRefreshToken({ id: 1 }), HS256_SECRET)).toEqual({
      id: 1,
      aud: 'refresh',
      iat: expect.any(Number),
      exp: expect.any(Number),
    })

    expect(verify(await appAuth.createRefreshToken({ id: 1, username: 'wan3land' } as any), HS256_SECRET)).toEqual({
      id: 1,
      username: 'wan3land',
      aud: 'refresh',
      iat: expect.any(Number),
      exp: expect.any(Number),
    })

    expect(verify(await graphityAuth.createRefreshToken({ id: 1 }), RS256_PUBLIC)).toEqual({
      id: 1,
      aud: 'graphity-refresh',
      iat: expect.any(Number),
      exp: expect.any(Number),
    })

    expect(verify(await appAuth.createRefreshToken({ id: 1 }, { role: 'user' }), HS256_SECRET)).toEqual({
      id: 1,
      aud: 'refresh',
      role: 'user',
      iat: expect.any(Number),
      exp: expect.any(Number),
    })

    expect(verify(await appAuth.createRefreshToken({ id: 1 }, { role: ['user', 'manager'] }), HS256_SECRET)).toEqual({
      id: 1,
      aud: 'refresh',
      role: ['user', 'manager'],
      iat: expect.any(Number),
      exp: expect.any(Number),
    })

  })

  it('test createRefreshToken fail', async () => {
    const refreshToken = await appAuth.createRefreshToken({ id: 1 }, { expiresIn: 0 })
    expect(() => verify(refreshToken, HS256_SECRET)).toThrowError('jwt expired')
  })

  it('test showRefreshToken success', async () => {
    expect(await appAuth.showRefreshToken(await appAuth.createRefreshToken({ id: 1 }))).toEqual({
      user: {
        id: 1,
      },
    })

    expect(await graphityAuth.showRefreshToken(await graphityAuth.createRefreshToken({ id: 1 }))).toEqual({
      user: {
        id: 1,
      },
    })

    expect(await appAuth.showRefreshToken(await appAuth.createRefreshToken({ id: 1, username: 'wan4land' } as any))).toEqual({
      user: {
        id: 1,
        username: 'wan4land',
      },
    })

    expect(await appAuth.showRefreshToken(await appAuth.createRefreshToken({ id: 1 }, { role: 'user' }))).toEqual({
      user: {
        id: 1,
      },
      role: 'user',
    })
  })

  it('test showRefreshToken fail', async () => {
    await expect(appAuth.showRefreshToken(await appAuth.createAccessToken({ id: 1 }))).rejects.toEqual(new JsonWebTokenError('jwt audience invalid. expected: refresh'))
    await expect(graphityAuth.showRefreshToken(await graphityAuth.createAccessToken({ id: 1 }))).rejects.toEqual(new JsonWebTokenError('jwt audience invalid. expected: graphity-refresh'))
  })

  it('test buildAuth success', async () => {
    expect(await appAuth.buildAuth(await appAuth.createAccessToken({ id: 1 }))).toEqual({
      roles: [],
      user: { id: 1 },
    })

    expect(await appAuth.buildAuth(await appAuth.createAccessToken({ id: 1, username: 'wan5land' } as any))).toEqual({
      roles: [],
      user: { id: 1, username: 'wan5land' },
    })

    expect(await appAuth.buildAuth(await appAuth.createAccessToken({ id: 1 }, { role: 'user' }))).toEqual({
      roles: ['user'],
      user: { id: 1 },
    })

    expect(await appAuth.buildAuth(await appAuth.createAccessToken({ id: 1 }, { role: ['manager', 'developer'] }))).toEqual({
      roles: ['manager', 'developer'],
      user: { id: 1 },
    })
  })

  it('test buildAuth fail', async () => {
    expect(await appAuth.buildAuth(null)).toEqual({
      roles: [],
    })

    expect(await appAuth.buildAuth('invalid token')).toEqual({
      roles: [],
    })

    expect(await appAuth.buildAuth(await appAuth.createRefreshToken({ id: 1 }))).toEqual({
      roles: [],
    })
  })
})
