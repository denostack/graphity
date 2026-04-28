
import { Containable } from '@graphity/container'

import { Graphity } from '../foundation/Graphity'
import { GraphityContext } from '../interfaces/context'


export function applyWsContextOnOperation(graphity: Graphity): Promise<{ $container: Containable }> {
  return graphity.boot()
    .then((): GraphityContext => {
      return {
        $container: graphity.container,
      }
    })
}
