import { GraphityError } from '../../errors/graphity-error'
import { Authorized } from './Authorized'


describe('graphity, auth/middleware/Authorized', () => {

  const createNext = (result: any) => () => result

  it('test Authorized', async () => {
    const Middleware = Authorized()
    const middleware = new Middleware()

    // Block
    await expect(middleware.handle({ context: {} } as any, createNext(true)))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'UNAUTHORIZED' })
    await expect(middleware.handle({ context: { $auth: { roles: [] } } } as any, createNext(true)))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'UNAUTHORIZED' })

    // Success
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: [] } } } as any, createNext(true))).resolves.toEqual(true)
  })

  it('test Authorized with a single role', async () => {
    const Middleware = Authorized(['admin'])
    const middleware = new Middleware()

    // Block
    await expect(middleware.handle({ context: {} } as any, createNext(true)))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'UNAUTHORIZED' })
    await expect(middleware.handle({ context: { $auth: { roles: [] } } } as any, createNext(true)))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'UNAUTHORIZED' })
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: [] } } } as any, createNext(true)))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'FORBIDDEN' })
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['developer'] } } } as any, createNext(true)))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'FORBIDDEN' })

    // Success
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['admin'] } } } as any, createNext(true))).resolves.toEqual(true)
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['admin', 'developer'] } } } as any, createNext(true))).resolves.toEqual(true)
  })

  it('test Authorized with many roles', async () => {
    const Middleware = Authorized(['admin', 'manager'])
    const middleware = new Middleware()

    // Block
    await expect(middleware.handle({ context: {} } as any, createNext(true)))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'UNAUTHORIZED' })
    await expect(middleware.handle({ context: { $auth: { roles: [] } } } as any, createNext(true)))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'UNAUTHORIZED' })
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: [] } } } as any, createNext(true)))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'FORBIDDEN' })
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['developer'] } } } as any, createNext(true)))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'FORBIDDEN' })

    // Success
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['admin'] } } } as any, createNext(true))).resolves.toEqual(true)
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['manager'] } } } as any, createNext(true))).resolves.toEqual(true)
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['admin', 'manager'] } } } as any, createNext(true))).resolves.toEqual(true)
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['admin', 'developer'] } } } as any, createNext(true))).resolves.toEqual(true)
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['manager', 'developer'] } } } as any, createNext(true))).resolves.toEqual(true)
  })

  it('test Authorized with handler', async () => {
    const Middleware = Authorized((auth, resource) => {
      return auth.roles.includes(resource)
    })
    const middleware = new Middleware()

    // Block
    await expect(middleware.handle({ context: {} } as any, createNext('developer')))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'UNAUTHORIZED' })
    await expect(middleware.handle({ context: { $auth: { roles: [] } } } as any, createNext('developer')))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'UNAUTHORIZED' })
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: [] } } } as any, createNext('developer')))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'FORBIDDEN' })
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['admin'] } } } as any, createNext('developer')))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'FORBIDDEN' })

    // Success
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['developer'] } } } as any, createNext('developer'))).resolves.toEqual('developer')
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['admin', 'developer'] } } } as any, createNext('developer'))).resolves.toEqual('developer')
  })

  it('test Authorized with async handler', async () => {
    const Middleware = Authorized((auth, resource) => {
      return Promise.resolve(auth.roles.includes(resource))
    })
    const middleware = new Middleware()

    // Block
    await expect(middleware.handle({ context: {} } as any, createNext('developer')))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'UNAUTHORIZED' })
    await expect(middleware.handle({ context: { $auth: { roles: [] } } } as any, createNext('developer')))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'UNAUTHORIZED' })
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: [] } } } as any, createNext('developer')))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'FORBIDDEN' })
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['admin'] } } } as any, createNext('developer')))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'FORBIDDEN' })

    // Success
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['developer'] } } } as any, createNext('developer'))).resolves.toEqual('developer')
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['admin', 'developer'] } } } as any, createNext('admin'))).resolves.toEqual('admin')
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['admin', 'developer'] } } } as any, createNext('developer'))).resolves.toEqual('developer')
  })

  it('test Authorized with roles and handler', async () => {
    const Middleware = Authorized(['manager', 'admin'], (auth, resource) => {
      return auth.user.id === resource
    })
    const middleware = new Middleware()

    // Block
    await expect(middleware.handle({ context: {} } as any, createNext(2)))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'UNAUTHORIZED' })
    await expect(middleware.handle({ context: { $auth: { roles: [] } } } as any, createNext(2)))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'UNAUTHORIZED' })
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: [] } } } as any, createNext(2)))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'FORBIDDEN' })

    // match roles, unmatch resource
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['admin'] } } } as any, createNext(2)))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'FORBIDDEN' })
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['manager'] } } } as any, createNext(2)))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'FORBIDDEN' })
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['admin', 'manager'] } } } as any, createNext(2)))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'FORBIDDEN' })

    // match resource, unmatch roles
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['developer'] } } } as any, createNext(1)))
      .rejects.toEqualError(GraphityError, { message: 'Access denied.', code: 'FORBIDDEN' })


    // Success
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['admin'] } } } as any, createNext(1))).resolves.toEqual(1)
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['manager'] } } } as any, createNext(1))).resolves.toEqual(1)
    await expect(middleware.handle({ context: { $auth: { user: { id: 1 }, roles: ['admin', 'manager'] } } } as any, createNext(1))).resolves.toEqual(1)
  })
})
