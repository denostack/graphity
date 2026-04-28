
import { Graphity } from '../foundation/Graphity'
import { AuthBuilder } from '../interfaces/auth'
import { GraphityContext, HttpRequest } from '../interfaces/context'
import { findAccessToken } from './findAccessToken'


export function applyHttpContext(graphity: Graphity, request: HttpRequest): Promise<GraphityContext> {
  const accessToken = findAccessToken(request.headers)
  return graphity.boot()
    .then(() => {
      if (graphity.container.has(AuthBuilder)) {
        return graphity.container.get(AuthBuilder).buildAuth(accessToken)
      }
      return Promise.resolve({ roles: [] })
    })
    .then((auth): GraphityContext => {
      return {
        $request: request,
        $container: graphity.container,
        $auth: auth,
      }
    })
}
