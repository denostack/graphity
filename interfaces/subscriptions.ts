
export interface Publishable {
  publish(eventName: string, payload: any): Promise<void>
}

export interface Subscribable {
  /**
   * GraphQL.js subscribe method requires AsyncIterable as a return value.
   * @ref https://github.com/graphql/graphql-js/blob/main/src/subscription/subscribe.js#L285
   */
  subscribe<T>(eventName: string | string[]): Promise<AsyncIterable<T>> | AsyncIterable<T>
}

export interface PubSub extends Publishable, Subscribable {
}

export interface ApolloPubSub {
  publish(triggerName: string, payload: any): Promise<void>
  asyncIterator<T>(triggers: string | string[]): AsyncIterator<T>
}
