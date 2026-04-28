/* eslint-disable max-classes-per-file, @typescript-eslint/no-extraneous-class */
import { Inject } from '../decorator/Inject'
import { UndefinedError } from '../errors/UndefinedError'
import { Container } from './Container'


function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

async function catcha(handler: () => any): Promise<any> {
  try {
    return await handler()
  } catch (e) {
    return e
  }
}

class Something {}

describe('@graphity/container, container/Container', () => {
  it('test predefined instances', () => {
    const container = new Container()

    expect(container.get(Container)).toBe(container)
    expect(container.get('container')).toBe(container)
  })

  it('test inject', async () => {

    class Mysql {
      public name = 'mysql'
    }

    class Postgres {
      public name = 'postgres'
    }

    class Mailer {
      public name = 'mailer'
    }


    class TestInjectController {

      @Inject(Mysql)
      _connection: any

      public constructor(
        @Inject(Mysql) @Inject(Postgres) public connection: any,
        public queue: any,
        @Inject(Mailer) public mailer: any,
        @Inject(Mysql, (mysql) => mysql.name) public mysqlName: any,
        @Inject(Postgres, (postgres) => Promise.resolve(postgres.name)) public postgresName: any,
      ) {
      }

      public unknown(@Inject('unknown') unknown: any) {
        return unknown
      }
    }

    const container = new Container()

    const mysql = new Mysql()
    const postgres = new Postgres()
    const mailer = new Mailer()

    container.instance(Mysql, mysql)
    container.instance(Postgres, postgres)
    container.instance(Mailer, mailer)

    const result = await container.create(TestInjectController)

    expect(result.connection).toBe(mysql) // assign first only
    expect(result._connection).toBe(mysql) // assign first only
    expect(result.queue).toBeUndefined() // undefined..!
    expect(result.mailer).toBe(mailer)
    expect(result.mysqlName).toBe('mysql')
    expect(result.postgresName).toBe('postgres')
  })

  it('test instance', async () => {
    const container = new Container()

    container.instance('obj1', { message: 'this is obj1' })
    container.instance('obj2', { message: 'this is obj2' })

    await container.boot()

    const result1 = container.get('obj1')
    const result2 = container.get('obj2')

    expect(result1).toEqual({ message: 'this is obj1' })
    expect(result2).toEqual({ message: 'this is obj2' })

    expect(container.get('obj1')).toBe(result1)
    expect(container.get('obj2')).toBe(result2)
  })

  it('test promise instance', async () => {
    const container = new Container()

    function promise1() {
      return new Promise(resolve => resolve({ message: 'this is promise1' }))
    }
    async function promise2() {
      sleep(500)
      return { message: 'this is promise2' }
    }

    container.instance('promise1', promise1())
    container.instance('promise2', promise2())

    await container.boot()

    const result1 = container.get('promise1')
    const result2 = container.get('promise2')

    expect(result1).toEqual({ message: 'this is promise1' })
    expect(result2).toEqual({ message: 'this is promise2' })

    expect(container.get('promise1')).toBe(result1)
    expect(container.get('promise2')).toBe(result2)
  })

  it('test resolve', async () => {
    const container = new Container()

    container.resolver('resolve1', () => ({ message: 'this is resolve' }))
    container.resolver('resolve2', () => {
      return new Promise(resolve => {
        resolve({ message: 'this is promise resolve' })
      })
    })
    container.resolver('resolve3', async () => {
      sleep(500)
      return { message: 'this is async resolve' }
    })

    await container.boot()

    expect(container.get('resolve1')).toEqual({ message: 'this is resolve' })
    expect(container.get('resolve2')).toEqual({ message: 'this is promise resolve' })
    expect(container.get('resolve3')).toEqual({ message: 'this is async resolve' })
  })

  it('test bind', async () => {
    expect.assertions(2)

    const container = new Container()

    class Driver {
    }

    class Connection {
      public constructor(@Inject('driver') public driver: Driver) {
      }
    }

    container.bind('driver', Driver)
    container.bind('connection', Connection)

    await container.boot()

    const connection = container.get<Connection>('connection')

    expect(connection).toBeInstanceOf(Connection)
    expect(connection.driver).toBeInstanceOf(Driver)
  })

  it('test bind without name', async () => {
    expect.assertions(2)

    const container = new Container()

    class Driver {
    }

    class Connection {
      public constructor(@Inject(Driver) public driver: Driver) {
      }
    }

    container.bind(Driver)
    container.bind(Connection)

    await container.boot()

    const connection = container.get(Connection)

    expect(connection).toBeInstanceOf(Connection)
    expect(connection.driver).toBeInstanceOf(Driver)
  })

  it('test create method', async () => {
    const container = new Container()

    class Connection {
    }

    class Controller {
      public constructor(@Inject('connection') public connection: Connection) {
      }
    }

    container.bind('connection', Connection)

    const controller = await container.create(Controller)

    expect(controller).toBeInstanceOf(Controller)
    expect(controller.connection).toBeInstanceOf(Connection)
  })

  it('test invoke method', async () => {
    const container = new Container()

    class Connection {
    }

    class Controller {
      public retrieve(@Inject('connection') connection: Connection) {
        return connection
      }
    }

    container.bind('connection', Connection)

    const controller = new Controller()

    await expect(container.invoke(controller, 'retrieve')).resolves.toBeInstanceOf(Connection)
  })

  it('test setToGlobal', () => {
    const originContainer = Container.instance

    expect(Container.instance).toBeInstanceOf(Container)
    expect(Container.instance).toBe(Container.instance)

    const container = new Container().setToGlobal()
    expect(container).toBeInstanceOf(Container)
    expect(container).toBe(Container.instance)

    expect(container).not.toBe(originContainer)
  })

  it('test boot lock', async () => {
    const container = new Container()

    let countOfCallRegister = 0
    let countOfCallBoot = 0

    container.register({
      async register() {
        countOfCallRegister++
        await new Promise(resolve => setTimeout(resolve, 500))
      },
      async boot() {
        countOfCallBoot++
        await new Promise(resolve => setTimeout(resolve, 500))
      },
    })

    await Promise.all([
      container.boot(),
      container.boot(),
      container.boot(),
    ])

    await container.boot()
    await container.boot()

    expect(countOfCallRegister).toBe(1)
    expect(countOfCallBoot).toBe(1)
  })

  it('test boot force', async () => {
    const container = new Container()

    let countOfCallRegister = 0
    let countOfCallBoot = 0

    container.register({
      async register() {
        countOfCallRegister++
        await new Promise(resolve => setTimeout(resolve, 500))
      },
      async boot() {
        countOfCallBoot++
        await new Promise(resolve => setTimeout(resolve, 500))
      },
    })

    await Promise.all([
      container.boot(),
      container.boot(),
      container.boot(),
    ])

    expect(countOfCallRegister).toBe(1)
    expect(countOfCallBoot).toBe(1)

    await container.boot(true)

    expect(countOfCallRegister).toBe(2)
    expect(countOfCallBoot).toBe(2)
  })

  it('test get singleton instance in same time', async () => {
    const container = new Container()

    container.resolver('instance', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { name: 'instance' }
    })

    const [inst1, inst2] = await Promise.all([
      container.resolve('instance'),
      container.resolve('instance'),
    ])

    expect(inst1).toBe(inst2)
  })

  it('test get singleton instance in similar time', async () => {
    const container = new Container()

    container.resolver('instance', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { name: 'instance' }
    })

    await container.boot()

    const [inst1, inst2] = await Promise.all([
      container.resolve('instance'),
      (async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return container.resolve('instance')
      })(),
    ])

    expect(inst1).toBe(inst2)
  })

  it('test simple error message', async () => {
    const container = new Container()

    const name1 = 'instance'
    const error1 = await catcha(() => container.get(name1))
    expect(error1).toBeInstanceOf(UndefinedError)
    expect(error1.message).toEqual('"instance" is not defined!\nresolve stack: "instance"')
    expect(error1.target).toEqual(name1)
    expect(error1.resolveStack).toEqual([name1])

    const name2 = Symbol('symbol')
    const error2 = await catcha(() => container.get(name2))
    expect(error2).toBeInstanceOf(UndefinedError)
    expect(error2.message).toEqual('Symbol(symbol) is not defined!\nresolve stack: Symbol(symbol)')
    expect(error2.target).toEqual(name2)
    expect(error2.resolveStack).toEqual([name2])

    const name3 = Something
    const error3 = await catcha(() => container.get(name3))
    expect(error3).toBeInstanceOf(UndefinedError)
    expect(error3.message).toEqual('Something is not defined!\nresolve stack: Something')
    expect(error3.target).toEqual(name3)
    expect(error3.resolveStack).toEqual([name3])

    const name4 = (() => class {})()
    const error4 = await catcha(() => container.get(name4))
    expect(error4).toBeInstanceOf(UndefinedError)
    expect(error4.message).toEqual('(anonymous class) is not defined!\nresolve stack: (anonymous class)')
    expect(error4.target).toEqual(name4)
    expect(error4.resolveStack).toEqual([name4])
  })

  it('test error message stack by resolver', async () => {
    const container = new Container()

    const stack1 = ['resolver1', 'instance']
    container.resolver(stack1[0], async () => ({ instance: await container.resolve(stack1[1]) }))
    const error1 = await catcha(() => container.resolve(stack1[0]))
    expect(error1).toBeInstanceOf(UndefinedError)
    expect(error1.message).toEqual('"instance" is not defined!\nresolve stack: "resolver1" -> "instance"')
    expect(error1.target).toEqual(stack1[1])
    expect(error1.resolveStack).toEqual(stack1)

    const stack2 = ['resolver2', Symbol('symbol')]
    container.resolver(stack2[0], async () => ({ instance: await container.resolve(stack2[1]) }))
    const error2 = await catcha(() => container.resolve(stack2[0]))
    expect(error2).toBeInstanceOf(UndefinedError)
    expect(error2.message).toEqual('Symbol(symbol) is not defined!\nresolve stack: "resolver2" -> Symbol(symbol)')
    expect(error2.target).toEqual(stack2[1])
    expect(error2.resolveStack).toEqual(stack2)

    const stack3 = ['resolver3', Something]
    container.resolver(stack3[0], async () => ({ instance: await container.resolve(stack3[1]) }))
    const error3 = await catcha(() => container.resolve(stack3[0]))
    expect(error3).toBeInstanceOf(UndefinedError)
    expect(error3.message).toEqual('Something is not defined!\nresolve stack: "resolver3" -> Something')
    expect(error3.target).toEqual(stack3[1])
    expect(error3.resolveStack).toEqual(stack3)

    const stack4 = ['resolver4', (() => class {})()]
    container.resolver(stack4[0], async () => ({ instance: await container.resolve(stack4[1]) }))
    const error4 = await catcha(() => container.resolve(stack4[0]))
    expect(error4).toBeInstanceOf(UndefinedError)
    expect(error4.message).toEqual('(anonymous class) is not defined!\nresolve stack: "resolver4" -> (anonymous class)')
    expect(error4.target).toEqual(stack4[1])
    expect(error4.resolveStack).toEqual(stack4)
  })

  it('test error message stack by resolver', async () => {
    const container = new Container()

    const stack1 = ['bind1', 'instance']
    class Bind1 { public constructor(@Inject(stack1[1]) public param: any) {} }
    container.bind(stack1[0], Bind1)
    const error1 = await catcha(() => container.resolve(stack1[0]))
    expect(error1).toBeInstanceOf(UndefinedError)
    expect(error1.message).toEqual('"instance" is not defined!\nresolve stack: "bind1" -> "instance"')
    expect(error1.target).toEqual(stack1[1])
    expect(error1.resolveStack).toEqual(stack1)

    const stack2 = ['bind2', Symbol('symbol')]
    class Bind2 { public constructor(@Inject(stack2[1]) public param: any) {} }
    container.bind(stack2[0], Bind2)
    const error2 = await catcha(() => container.resolve(stack2[0]))
    expect(error2).toBeInstanceOf(UndefinedError)
    expect(error2.message).toEqual('Symbol(symbol) is not defined!\nresolve stack: "bind2" -> Symbol(symbol)')
    expect(error2.target).toEqual(stack2[1])
    expect(error2.resolveStack).toEqual(stack2)

    const stack3 = ['bind3', Something]
    class Bind3 { public constructor(@Inject(stack3[1]) public param: any) {} }
    container.bind(stack3[0], Bind3)
    const error3 = await catcha(() => container.resolve(stack3[0]))
    expect(error3).toBeInstanceOf(UndefinedError)
    expect(error3.message).toEqual('Something is not defined!\nresolve stack: "bind3" -> Something')
    expect(error3.target).toEqual(stack3[1])
    expect(error3.resolveStack).toEqual(stack3)

    const stack4 = ['bind4', (() => class {})()]
    class Bind4 { public constructor(@Inject(stack4[1]) public param: any) {} }
    container.bind(stack4[0], Bind4)
    const error4 = await catcha(() => container.resolve(stack4[0]))
    expect(error4).toBeInstanceOf(UndefinedError)
    expect(error4.message).toEqual('(anonymous class) is not defined!\nresolve stack: "bind4" -> (anonymous class)')
    expect(error4.target).toEqual(stack4[1])
    expect(error4.resolveStack).toEqual(stack4)
  })

  it('test error message mnany stack', async () => {
    const container = new Container()

    const stack = ['instance', Symbol('symbol'), Something, (() => class {})(), 'unknown']

    container.resolver(stack[0], async () => ({ instance: await container.resolve(stack[1]) }))
    container.resolver(stack[1], async () => ({ instance: await container.resolve(stack[2]) }))
    container.resolver(stack[2], async () => ({ instance: await container.resolve(stack[3]) }))
    container.resolver(stack[3], async () => ({ instance: await container.resolve(stack[4]) }))

    const e = await catcha(() => container.resolve(stack[0]))
    expect(e).toBeInstanceOf(UndefinedError)
    expect(e.message).toEqual('"unknown" is not defined!\nresolve stack: "instance" -> Symbol(symbol) -> Something -> (anonymous class) -> "unknown"')
    expect(e.target).toEqual(stack[4])
    expect(e.resolveStack).toEqual(stack)
  })
})
