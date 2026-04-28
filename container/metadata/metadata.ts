
import { MetadataInjectParam, MetadataInjectProp } from '../interfaces/metadata'

export const metadata = {
  injectParams: new WeakMap<Function, MetadataInjectParam[]>(),
  injectProps: new WeakMap<Function, MetadataInjectProp[]>(),
}

// internal only
export function _clearMetadata() {
  metadata.injectParams = new WeakMap()
  metadata.injectParams = new WeakMap()
}
