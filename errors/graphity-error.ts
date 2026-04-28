
export class GraphityError extends Error {
  public constructor(message: string, public code: string = 'UNKNOWN') {
    super(message)
    this.name = 'GraphityError'
  }
}
