import { toLowerCaseKey } from './toLowerCaseKey'


describe('graphity, utils/toLowerCaseKey', () => {
  it('test toLowerCaseKey', () => {
    expect(toLowerCaseKey({ 'X-Graphity-Version': 'v0.0.1' })).toEqual({ 'x-graphity-version': 'v0.0.1' })
  })
})
