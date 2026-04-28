# Graphity - Server Express

<a href="https://npmcharts.com/compare/@graphity/server-express?minimal=true"><img alt="Downloads" src="https://img.shields.io/npm/dt/@graphity/server-express.svg?style=flat-square" /></a>
<a href="https://www.npmjs.com/package/@graphity/server-express"><img alt="Version" src="https://img.shields.io/npm/v/@graphity/server-express.svg?style=flat-square" /></a>
<img alt="License" src="https://img.shields.io/npm/l/@graphity/server-express.svg?style=flat-square" />
<img alt="Typescript" src="https://img.shields.io/badge/language-Typescript-007acc.svg?style=flat-square" />
<br />
<a href="https://david-dm.org/wan2land/graphity?path=packages/graphity-server-express"><img alt="dependencies Status" src="https://img.shields.io/david/wan2land/graphity.svg?style=flat-square&path=packages/graphity-server-express" /></a>

## Installation

```bash
npm install @graphity/server-express --save
```

```typescript
import { Graphity } from 'graphity'
import { ServerExpress } from '@graphity/server-express'

const graphity = new Graphity({
  resolvers: [
    HomeResolver,
    /* ... */
  ],
})

graphity.register(new AuthProvider())
graphity.register(new AwsProvider())
graphity.register(new TypeormProvider())

const server = new ServerExpress(graphity) // without boot
server.start(8080)
```
