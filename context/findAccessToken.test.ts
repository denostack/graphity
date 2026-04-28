import { findAccessToken } from './findAccessToken'

describe('graphity, context/findAccessToken', () => {
  it('test findAccessToken fail', () => {
    expect(findAccessToken(true)).toBeNull()
    expect(findAccessToken(false)).toBeNull()
    expect(findAccessToken(null)).toBeNull()
    expect(findAccessToken(undefined)).toBeNull()
    expect(findAccessToken([])).toBeNull()
    expect(findAccessToken({})).toBeNull()
    expect(findAccessToken('')).toBeNull()
    expect(findAccessToken('Bearer ')).toBeNull()
  })

  it('test findAccessToken success', () => {
    // number
    expect(findAccessToken(1234)).toEqual('1234')

    // string
    expect(findAccessToken('ACCESS_TOKEN')).toEqual('ACCESS_TOKEN')
    expect(findAccessToken('bearer ACCESS_TOKEN')).toEqual('ACCESS_TOKEN')
    expect(findAccessToken('Bearer ACCESS_TOKEN')).toEqual('ACCESS_TOKEN')
    expect(findAccessToken('BEARER ACCESS_TOKEN')).toEqual('ACCESS_TOKEN')
    expect(findAccessToken('bearer\nACCESS_TOKEN')).toEqual('ACCESS_TOKEN')

    // array
    expect(findAccessToken(['ACCESS_TOKEN'])).toEqual('ACCESS_TOKEN')
    expect(findAccessToken(['bearer ACCESS_TOKEN'])).toEqual('ACCESS_TOKEN')
    expect(findAccessToken(['Bearer ACCESS_TOKEN'])).toEqual('ACCESS_TOKEN')

    expect(findAccessToken(['ACCESS_TOKEN', 'ignored'])).toEqual('ACCESS_TOKEN')
    expect(findAccessToken(['bearer ACCESS_TOKEN', 'ignored'])).toEqual('ACCESS_TOKEN')
    expect(findAccessToken(['Bearer ACCESS_TOKEN', 'ignored'])).toEqual('ACCESS_TOKEN')

    // object (authToken)
    expect(findAccessToken({ authtoken: 'ACCESS_TOKEN' })).toEqual('ACCESS_TOKEN')

    expect(findAccessToken({ authToken: 'ACCESS_TOKEN' })).toEqual('ACCESS_TOKEN')
    expect(findAccessToken({ authToken: 'bearer ACCESS_TOKEN' })).toEqual('ACCESS_TOKEN')
    expect(findAccessToken({ authToken: 'Bearer ACCESS_TOKEN' })).toEqual('ACCESS_TOKEN')

    // object (accessToken)
    expect(findAccessToken({ accesstoken: 'ACCESS_TOKEN' })).toEqual('ACCESS_TOKEN')

    expect(findAccessToken({ accessToken: 'ACCESS_TOKEN' })).toEqual('ACCESS_TOKEN')
    expect(findAccessToken({ accessToken: 'bearer ACCESS_TOKEN' })).toEqual('ACCESS_TOKEN')
    expect(findAccessToken({ accessToken: 'Bearer ACCESS_TOKEN' })).toEqual('ACCESS_TOKEN')

    // object (authorization)
    expect(findAccessToken({ authorization: 'ACCESS_TOKEN' })).toEqual('ACCESS_TOKEN')
    expect(findAccessToken({ authorization: 'bearer ACCESS_TOKEN' })).toEqual('ACCESS_TOKEN')
    expect(findAccessToken({ authorization: 'Bearer ACCESS_TOKEN' })).toEqual('ACCESS_TOKEN')

    expect(findAccessToken({ Authorization: 'ACCESS_TOKEN' })).toEqual('ACCESS_TOKEN')
    expect(findAccessToken({ Authorization: 'bearer ACCESS_TOKEN' })).toEqual('ACCESS_TOKEN')
    expect(findAccessToken({ Authorization: 'Bearer ACCESS_TOKEN' })).toEqual('ACCESS_TOKEN')

    expect(findAccessToken({ AUTHORIZATION: 'ACCESS_TOKEN' })).toEqual('ACCESS_TOKEN')
    expect(findAccessToken({ AUTHORIZATION: 'bearer ACCESS_TOKEN' })).toEqual('ACCESS_TOKEN')
    expect(findAccessToken({ AUTHORIZATION: 'Bearer ACCESS_TOKEN' })).toEqual('ACCESS_TOKEN')

    // object (headers.Authorization)
    expect(findAccessToken({ headers: { Authorization: 'ACCESS_TOKEN' } })).toEqual('ACCESS_TOKEN')
    expect(findAccessToken({ headers: { Authorization: 'bearer ACCESS_TOKEN' } })).toEqual('ACCESS_TOKEN')
    expect(findAccessToken({ headers: { Authorization: 'Bearer ACCESS_TOKEN' } })).toEqual('ACCESS_TOKEN')
  })
})
