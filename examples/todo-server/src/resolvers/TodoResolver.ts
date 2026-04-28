import {
  Authorized,
  GraphityContext,
  GraphityResolver,
  GraphQLNonNullList,
  Inject,
  Mutation,
  Query,
  Subscription,
  withFilter,
} from "graphity";
import { GraphQLBoolean, GraphQLID, GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from "graphql";
import { Connection, In, Repository } from "typeorm";

import { Todo } from "../entities/Todo";

@GraphityResolver((_) => Todo)
export class TodoResolver {
  constructor(
    @Inject(Connection, (c) => c.getRepository(Todo)) public repoTodos: Repository<Todo>,
  ) {
  }

  @Query({
    middlewares: [
      Authorized("user"),
    ],
    returns: GraphQLNonNullList,
  })
  todos(_: null, params: any, context: GraphityContext) {
    return this.repoTodos.find({
      where: {
        userId: context.$auth.user!.id,
      },
      order: { id: "DESC" },
    });
  }

  @Mutation({
    input: {
      input: {
        type: new GraphQLInputObjectType({
          name: "InputCreateTodo",
          fields: {
            title: { type: GraphQLNonNull(GraphQLString) },
          },
        }),
      },
    },
    middlewares: [
      Authorized("user"),
    ],
  })
  createTodo(
    _: null,
    params: {
      input: {
        title: string;
      };
    },
    context: GraphityContext,
  ) {
    return this.repoTodos.save(this.repoTodos.create({
      userId: context.$auth.user!.id,
      title: params.input.title,
    })).then((node) => context.$pubsub?.publish("TODO_CREATED", node).then(() => node));
  }

  @Subscription({
    middlewares: [
      Authorized("user"),
    ],
    subscribe: (_, params: any, context: GraphityContext) => {
      return withFilter(context.$pubsub!.subscribe<Todo>("TODO_CREATED"), (todo) => {
        return `${todo.userId}` === `${context.$auth.user!.id}`;
      });
    },
  })
  subscribeTodoCreated(payload: Todo) {
    return payload;
  }

  @Mutation({
    input: {
      id: { type: GraphQLNonNull(GraphQLID) },
      input: {
        type: new GraphQLInputObjectType({
          name: "InputUpdateTodo",
          fields: {
            title: { type: GraphQLNonNull(GraphQLString) },
            completed: { type: GraphQLNonNull(GraphQLBoolean) },
          },
        }),
      },
    },
    middlewares: [
      Authorized("user"),
    ],
  })
  async updateTodo(
    _: null,
    params: {
      id: string;
      input: {
        title: string;
        completed: boolean;
      };
    },
    context: GraphityContext,
  ) {
    const node = await this.repoTodos.findOneOrFail({
      id: params.id,
      userId: context.$auth.user!.id,
    });
    return this.repoTodos.save(this.repoTodos.merge(node, {
      title: params.input.title,
      completed: params.input.completed,
    })).then((node) => context.$pubsub?.publish("TODOS_UPDATE", [node]).then(() => node));
  }

  @Mutation({
    input: {
      ids: { type: GraphQLNonNullList(GraphQLID) },
    },
    middlewares: [
      Authorized("user"),
    ],
    returns: GraphQLNonNullList,
  })
  async completeTodos(
    _: null,
    params: {
      ids: string[];
    },
    context: GraphityContext,
  ) {
    if (params.ids.length === 0) {
      return [];
    }

    const nodes = await this.repoTodos.find({
      id: In(params.ids),
      userId: context.$auth.user!.id,
    });
    if (nodes.length === 0) {
      return [];
    }

    return this.repoTodos.save(nodes.map((node) =>
      this.repoTodos.merge(node, {
        completed: true,
      })
    )).then((nodes) => context.$pubsub?.publish("TODOS_UPDATE", nodes).then(() => nodes));
  }

  @Mutation({
    input: {
      ids: { type: GraphQLNonNullList(GraphQLID) },
    },
    middlewares: [
      Authorized("user"),
    ],
    returns: GraphQLNonNullList,
  })
  async uncompleteTodos(
    _: null,
    params: {
      ids: string[];
    },
    context: GraphityContext,
  ) {
    if (params.ids.length === 0) {
      return [];
    }

    const nodes = await this.repoTodos.find({
      id: In(params.ids),
      userId: context.$auth.user!.id,
    });
    if (nodes.length === 0) {
      return [];
    }

    return this.repoTodos.save(nodes.map((node) =>
      this.repoTodos.merge(node, {
        completed: false,
      })
    )).then((nodes) => context.$pubsub?.publish("TODOS_UPDATE", nodes).then(() => nodes));
  }

  @Subscription({
    middlewares: [
      Authorized("user"),
    ],
    subscribe: (_: null, params: any, context: GraphityContext) => {
      return withFilter(context.$pubsub!.subscribe<Todo[]>("TODOS_UPDATE"), (todos) => {
        for (const todo of todos) {
          if (`${todo.userId}` === `${context.$auth.user!.id}`) {
            return true;
          }
        }
        return false;
      });
    },
    returns: GraphQLNonNullList,
  })
  subscribeTodosUpdated(todos: Todo[], params: any, context: GraphityContext) {
    return todos.filter((todo) => `${todo.userId}` === `${context.$auth.user!.id}`);
  }

  @Mutation({
    middlewares: [
      Authorized("user"),
    ],
    input: {
      id: { type: GraphQLNonNull(GraphQLID) },
    },
  })
  async deleteTodo(
    _: null,
    params: {
      id: string;
    },
    context: GraphityContext,
  ) {
    const node = await this.repoTodos.findOneOrFail({
      id: params.id,
      userId: context.$auth.user!.id,
    });
    await this.repoTodos.delete({ id: node.id });
    await context.$pubsub?.publish("TODOS_DELETED", [node]);
    return node;
  }

  @Mutation({
    middlewares: [
      Authorized("user"),
    ],
    input: {
      ids: { type: GraphQLNonNullList(GraphQLID) },
    },
    returns: GraphQLNonNullList,
  })
  async deleteTodos(
    _: null,
    params: {
      ids: string[];
    },
    context: GraphityContext,
  ) {
    if (params.ids.length === 0) {
      return [];
    }
    const nodes = await this.repoTodos.find({
      id: In(params.ids),
      userId: context.$auth.user!.id,
    });
    if (nodes.length === 0) {
      return [];
    }

    await this.repoTodos.delete({ id: In(nodes.map(({ id }) => id)) });
    await context.$pubsub?.publish("TODOS_DELETED", nodes);
    return nodes;
  }

  @Subscription({
    middlewares: [
      Authorized("user"),
    ],
    subscribe: (_: null, params: any, context: GraphityContext) => {
      return withFilter(context.$pubsub!.subscribe<Todo[]>("TODOS_DELETED"), (todos) => {
        for (const todo of todos) {
          if (`${todo.userId}` === `${context.$auth.user!.id}`) {
            return true;
          }
        }
        return false;
      });
    },
    returns: GraphQLNonNullList,
  })
  subscribeTodosDeleted(todos: Todo[], params: any, context: GraphityContext) {
    return todos.filter((todo) => `${todo.userId}` === `${context.$auth.user!.id}`);
  }
}
