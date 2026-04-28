import { Request } from 'express'
import { HttpRequest } from 'graphity'

export function reqToHttpRequest(req: Request): HttpRequest {
  const headers = Object.entries(req.headers)
    .reduce<Record<string, any>>((carry, [name, header]) => (carry[name.toLowerCase()] = header, carry), {}) // eslint-disable-line no-return-assign

  return {
    host: headers.host || req.host || req.hostname,
    method: (req.method || '').toUpperCase(),
    headers,
    path: req.path,
    query: req.query ?? {},
    raw: req,
  }
}
