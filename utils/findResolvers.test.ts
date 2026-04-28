/* eslint-disable max-classes-per-file */
import { MetadataStorage } from '@graphity/schema'
import fastGlob from 'fast-glob'

import { findResolvers } from './findResolvers'


jest.mock('fast-glob')

describe('graphity, utils/findResolvers', () => {
  it('test findResolvers', () => {

    class JustResolver1 {} // eslint-disable-line @typescript-eslint/no-extraneous-class
    class JustResolver2 {} // eslint-disable-line @typescript-eslint/no-extraneous-class
    class SingleResolver {} // eslint-disable-line @typescript-eslint/no-extraneous-class
    class SingleNothing {} // eslint-disable-line @typescript-eslint/no-extraneous-class
    class ArrayResolver {} // eslint-disable-line @typescript-eslint/no-extraneous-class
    class ArrayNothing {} // eslint-disable-line @typescript-eslint/no-extraneous-class
    class ObjectResolver {} // eslint-disable-line @typescript-eslint/no-extraneous-class
    class ObjectNothing {} // eslint-disable-line @typescript-eslint/no-extraneous-class

    (fastGlob.sync as any).mockReturnValue([
      './resolvers/single-resolver',
      './resolvers/single-nothing',
      './vendor/resolvers/array',
      './vendor/resolvers/object',
    ])

    jest.mock('./resolvers/single-resolver', () => SingleResolver, { virtual: true })
    jest.mock('./resolvers/single-nothing', () => SingleNothing, { virtual: true })
    jest.mock('./vendor/resolvers/array', () => [ArrayResolver, ArrayNothing], { virtual: true })
    jest.mock('./vendor/resolvers/object', () => ({ ObjectResolver, ObjectNothing }), { virtual: true })

    const storage = new MetadataStorage()
    storage.resolvers.set(JustResolver1, { target: JustResolver1, typeFactory: () => JustResolver1, middlewares: [] })
    storage.resolvers.set(JustResolver2, { target: JustResolver2, typeFactory: () => JustResolver2, middlewares: [] })
    storage.resolvers.set(SingleResolver, { target: SingleResolver, typeFactory: () => SingleResolver, middlewares: [] })
    storage.resolvers.set(ArrayResolver, { target: ArrayResolver, typeFactory: () => ArrayResolver, middlewares: [] })
    storage.resolvers.set(ObjectResolver, { target: ObjectResolver, typeFactory: () => ObjectResolver, middlewares: [] })

    const resolvers = findResolvers(storage, [
      JustResolver1,
      './resolvers/**/*.js',
      './vendor/resolvers/**/*.js',
      JustResolver2,
    ])


    expect((fastGlob.sync as any).mock.calls[0]).toEqual([['./resolvers/**/*.js', './vendor/resolvers/**/*.js']])
    expect(resolvers).toStrictEqual([
      JustResolver1,
      JustResolver2,
      SingleResolver,
      ArrayResolver,
      ObjectResolver,
    ])
  })
})
