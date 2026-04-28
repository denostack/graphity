import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda'
import { HttpRequest } from 'graphity'

export function eventToHttpRequest(event: APIGatewayProxyEvent | APIGatewayProxyEventV2): HttpRequest {
  const headers = Object.entries(event.headers).reduce<Record<string, string>>((carry, [name, header]) => {
    if (header) {
      carry[name.toLowerCase()] = header
    }
    return carry
  }, {})

  return {
    host: event.requestContext.domainName ?? headers.host,
    method: (
      (event as APIGatewayProxyEvent).httpMethod
      || (event as APIGatewayProxyEventV2).requestContext.http.method
      || ''
    ).toUpperCase(),
    headers,
    path:
      (event as APIGatewayProxyEvent).path
      || (event as APIGatewayProxyEventV2).requestContext.http.path
      || '/',
    query: event.queryStringParameters ?? {},
    raw: event,
  }
}
