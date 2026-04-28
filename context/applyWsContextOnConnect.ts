
import { Graphity } from '../foundation/Graphity'
import { AuthBuilder, GraphityAuth } from '../interfaces/auth'
import { findAccessToken } from './findAccessToken'


export function applyWsContextOnConnect(graphity: Graphity, connectionParams: any): Promise<{ $auth: GraphityAuth }> {
  const accessToken = findAccessToken(connectionParams)
  return graphity.boot()
    .then(() => {
      if (graphity.container.has(AuthBuilder)) {
        return graphity.container.get(AuthBuilder).buildAuth(accessToken)
      }
      return Promise.resolve({ roles: [] })
    })
    .then((auth) => {
      return {
        $auth: auth,
      }
    })
}
