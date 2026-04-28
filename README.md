<p align="center">
  <img src="./logo.svg" alt="graphity" width="400" />
</p>

<p align="center">GraphQL Typescript Framework</p>

<p align="center">
  <a href="https://github.com/wan2land/graphity/actions?query=workflow%3A%22Node.js+CI%22"><img alt="Build" src="https://img.shields.io/github/workflow/status/wan2land/graphity/Node.js%20CI?logo=github&style=flat-square" /></a>
  <img alt="Version" src="https://img.shields.io/badge/dynamic/json?style=flat-square&color=fe7d37&label=version&query=%24.version&url=https%3A%2F%2Fraw.githubusercontent.com%2Fwan2land%2Fgraphity%2Fmaster%2Flerna.json" />
  <img alt="License MIT" src="https://img.shields.io/badge/license-MIT-97ca00.svg?style=flat-square" />
  <img alt="Language Typescript" src="https://img.shields.io/badge/language-Typescript-007acc.svg?style=flat-square" />
  <br />
  <a href="https://david-dm.org/wan2land/graphity"><img alt="dependencies Status" src="https://img.shields.io/david/wan2land/graphity.svg?style=flat-square" /></a>
  <a href="https://david-dm.org/wan2land/graphity?type=dev"><img alt="devDependencies Status" src="https://img.shields.io/david/dev/wan2land/graphity.svg?style=flat-square" /></a>
</p>

**Graphity** is a library that makes typescript and GraphQL easy to use. As much as possible, the object of [GraphQL.js](https://github.com/graphql/graphql-js) can be used as it is.

## Projects

**Core**

- [graphity](./packages/graphity)
- [@graphity/container](./packages/graphity-container)
- [@graphity/schema](./packages/graphity-schema)
- [@graphity/types](./packages/graphity-types)

**Server**

- [@graphity/server-express](./packages/graphity-server-express) - Using Graphity on Express Server
- [@graphity/server-lambda](./packages/graphity-server-lambda) - Using Graphity on AWS Lambda

**Miscellaneous**

- 

**Extensions(Experimantal)**

- [@graphity-extensions/restful](./extensions/restful)

## Installation

Currently, **Graphity** is only responsible for the Schema of GraphQL and can be run through [Apollo Server](https://github.com/apollographql/apollo-server).

```
npm i graphity apollo-server
```

### Typescript Confituration

set this option in `tsconfig.json` file of your project.

```json
{
  "experimentalDecorators": true
}
```

## Example

- [TodoMVC Server](./examples/todo-server)
- [TodoMVC Client](./examples/todo-client)

## Documents

Let's create a Todo list using Graphity. The minimum unit in Graphity is Entity.

```ts
import { Field, GraphityEntity } from "graphity"
import { GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString } from "graphql"


@GraphityEntity({
  description: "todo entity",
})
export class Todo {
  @Field(type => GraphQLID)
  public id!: string

  @Field(type => GraphQLNonNull(GraphQLString), {
    description: "do what you want to do",
  })
  public contents!: string | null

  @Field(type => GraphQLBoolean)
  public isDone!: boolean
}
```

This entity is converted to a GraphQL Schema:

```graphql
"""todo entity"""
type Todo {
  id: ID

  """do what you want to do"""
  contents: String!
  isDone: Boolean
}
```

Now let's create a **Resolver** that returns **Todo Entity**. If you create an entire CRUD with an array without a DB:

```ts
import {
  GraphQLListOf,
  GraphityResolver,
  listOf,
  Mutation,
  Query
  } from "graphity"
import { GraphQLID, GraphQLNonNull, GraphQLString } from "graphql"
import { Todo } from "../entities/todo"

let increment = 1

@GraphityResolver(type => Todo)
export class TodoResolver {

  public repo: Todo[] = []

  @Query({
    returns: todo => GraphQLListOf(todo),
  })
  public todos() {
    return listOf(this.repo)
  }

  @Query({
    input: {
      id: {type: GraphQLID},
    },
  })
  public todo(parent: null, input: {id: string}) {
    return this.repo.find(({id}) => id === input.id)
  }

  @Mutation({
    input: {
      contents: {
        type: GraphQLString,
      },
    },
  })
  public createTodo(parent: null, input: {contents?: string | null}) {
    const id = increment++
    const todo = Object.assign(new Todo(), {
      id: `${id}`,
      contents: input.contents,
    })
    this.repo.push(todo)
    return todo
  }

  @Mutation({
    input: {
      id: {
        type: GraphQLNonNull(GraphQLID),
      },
      contents: {
        type: GraphQLString,
      },
    },
  })
  public updateTodo(parent: null, input: {id: string, contents?: string | null}) {
    const todo = this.repo.find(({id}) => id === input.id)
    if (!todo) {
      return null
    }
    if (typeof input.contents !== "undefined") {
      todo.contents = input.contents
    }
    return todo
  }

  @Mutation({
    input: {
      id: {
        type: GraphQLNonNull(GraphQLID),
      },
    },
    description: "change 'isDone' to true",
  })
  public doneTodo(parent: null, input: {id: string}) {
    const todo = this.repo.find(({id}) => id === input.id)
    if (!todo) {
      return null
    }
    todo.isDone = true
    return todo
  }

  @Mutation({
    input: {
      id: {
        type: GraphQLNonNull(GraphQLID),
      },
    },
    description: "change 'isDone' to false",
  })
  public undoneTodo(parent: null, input: {id: string}) {
    const todo = this.repo.find(({id}) => id === input.id)
    if (!todo) {
      return null
    }
    todo.isDone = false
    return todo
  }

  @Mutation({
    input: {
      id: {
        type: GraphQLNonNull(GraphQLID),
      },
    },
  })
  public deleteTodo(parent: null, input: {id: string}) {
    const todo = this.repo.find(({id}) => id === input.id)
    if (!todo) {
      return null
    }
    this.repo.splice(this.repo.indexOf(todo), 1)
    return todo
  }
}
```

**Resolver** creates Query and Mutation.

```graphql
type Query {
  todos: ListOfTodo
  todo(id: ID): Todo
}

type Mutation {
  createTodo(contents: String): Todo
  updateTodo(id: ID!, contents: String): Todo

  """change 'isDone' to true"""
  doneTodo(id: ID!): Todo

  """change 'isDone' to false"""
  undoneTodo(id: ID!): Todo
  deleteTodo(id: ID!): Todo
}

type ListOfTodo {
  totalCount: Int!
  nodes: [Todo!]!
}
```

And on the server, you can do the following:

```typescript

import { ApolloServer } from "apollo-server"
import { createSchema } from "graphity"
import { TodoResolver } from "./resolvers/todo-resolver"

const app = new Graphity({
  resolvers: [
    TodoResolver,
  ],
})

const server = new ApolloServer({
  schema: app.createSchema(),
  context: ({ req }) => app.createContext(req),
})

server.listen(8888)

```

## License

MIT
