import { toLowerCaseKey } from '../utils/toLowerCaseKey'

export function findAccessToken(params: any): string | null {
  if (typeof params === 'string' || typeof params === 'number') {
    return `${params}`.replace(/^bearer\s+/i, '') || null
  }
  if (Array.isArray(params)) {
    return findAccessToken(params[0])
  }
  if (typeof params === 'object' && params !== null) {
    const filtered = toLowerCaseKey(params)
    // https://www.apollographql.com/docs/graphql-subscriptions/authentication/
    if (filtered.authtoken) {
      return findAccessToken(filtered.authtoken)
    }

    if (filtered.accesstoken) {
      return findAccessToken(filtered.accesstoken)
    }

    // https://github.com/apollographql/subscriptions-transport-ws/issues/171#issuecomment-316376468
    if (filtered.authorization) {
      return findAccessToken(filtered.authorization)
    }

    // https://github.com/apollographql/subscriptions-transport-ws/issues/171#issuecomment-358306164
    if (filtered.headers) {
      return findAccessToken(filtered.headers)
    }
  }
  return null
}
