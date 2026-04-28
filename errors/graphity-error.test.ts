import { GraphityError as GraphityErrorBuild } from '../../lib/errors/graphity-error'
import { GraphityError as GraphityErrorSrc } from './graphity-error'

const testsuites = [
  {
    name: 'build',
    GraphityError: GraphityErrorBuild,
  },
  {
    name: 'source',
    GraphityError: GraphityErrorSrc,
  },
]

for (const { name, GraphityError } of testsuites) {

  describe(`graphity, errors/graphity-error (${name})`, () => {
    it('test create error', () => {
      expect(new GraphityError('error on tests').name).toEqual('GraphityError')
      expect(new GraphityError('error on tests') instanceof GraphityError)
    })

    it('test error occured', () => {
      try {
        throw new GraphityError('error on tests')
      } catch (e) {
        expect(e).toBeInstanceOf(GraphityError)
        expect(e.name).toEqual('GraphityError')
      }
    })
  })
}
