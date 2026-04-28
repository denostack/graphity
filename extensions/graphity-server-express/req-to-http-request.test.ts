import { reqToHttpRequest } from './req-to-http-request'

const requestSample = {
  method: 'get',
  path: '/',
  query: {
    hello: 'world',
  },
  headers: {
    'host': 'graphity.wani.kr',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'ko,en;q=0.9,en-US;q=0.8',
  },
}

describe('testsuite of req-to-http-request', () => {
  it('test reqToHttpRequest', () => {
    expect(reqToHttpRequest(requestSample as any)).toEqual({
      host: 'graphity.wani.kr',
      method: 'GET',
      headers: {
        'host': 'graphity.wani.kr',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'ko,en;q=0.9,en-US;q=0.8',
      },
      path: '/',
      query: {
        hello: 'world',
      },
      raw: expect.anything(),
    })
  })
})
