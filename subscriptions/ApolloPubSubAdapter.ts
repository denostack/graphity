import { PubSub, ApolloPubSub } from '../interfaces/subscriptions'

export class ApolloPubSubAdapter implements PubSub {

  constructor(public pubsub: ApolloPubSub) {
  }

  publish(eventName: string, payload: any): Promise<void> {
    return this.pubsub.publish(eventName, payload)
  }

  subscribe<T>(eventName: string | string[]): Promise<AsyncIterable<T>> | AsyncIterable<T> {
    return {
      [Symbol.asyncIterator]: () => this.pubsub.asyncIterator(eventName),
    }
  }
}
