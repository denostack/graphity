# Graphity - Server Lambda

<a href="https://npmcharts.com/compare/@graphity/server-lambda?minimal=true"><img alt="Downloads" src="https://img.shields.io/npm/dt/@graphity/server-lambda.svg?style=flat-square" /></a>
<a href="https://www.npmjs.com/package/@graphity/server-lambda"><img alt="Version" src="https://img.shields.io/npm/v/@graphity/server-lambda.svg?style=flat-square" /></a>
<img alt="License" src="https://img.shields.io/npm/l/@graphity/server-lambda.svg?style=flat-square" />
<img alt="Typescript" src="https://img.shields.io/badge/language-Typescript-007acc.svg?style=flat-square" />
<br />
<a href="https://david-dm.org/wan2land/graphity?path=packages/graphity-server-lambda"><img alt="dependencies Status" src="https://img.shields.io/david/wan2land/graphity.svg?style=flat-square&path=packages/graphity-server-lambda" /></a>

## Installation

```bash
npm install @graphity/server-lambda --save
```

```typescript
import { APIGatewayProxyHandler } from 'aws-lambda'

import { Graphity } from 'graphity'
import { ServerLambda } from '@graphity/server-lambda'

const graphity = new Graphity({
  resolvers: [
    HomeResolver,
    /* ... */
  ],
})

graphity.register(new AuthProvider())
graphity.register(new AwsProvider())
graphity.register(new TypeormProvider())

const server = new ServerLambda(graphity) // without boot

export const handler: APIGatewayProxyHandler = (event, ctx, callback) => server.execute(event, ctx, callback)
```


## Options

```typescript
interface ServerLambdaOptions {
  callbackWaitsForEmptyEventLoop?: boolean
  cors?: {
    origin?: boolean | string | string[],
    methods?: string | string[],
    allowedHeaders?: string | string[],
    exposedHeaders?: string | string[],
    credentials?: boolean,
    maxAge?: number,
  }
}
```

**CORS**

To use CORS, simply set the following options.

```typescript
const server = new ServerLambda(graphity, {
  cors: {
    origin: '*',
    credentials: true,
  },
})
```

**callbackWaitsForEmptyEventLoop**

When using a persistent connection such as a database, there may be no response. In this case, you can do the following:

```typescript
const server = new ServerLambda(graphity, {
  callbackWaitsForEmptyEventLoop: false,
})
```

For more information, see [AWS Lambda Context Object in Node.js](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html).
