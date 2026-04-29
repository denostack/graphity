# <img src="./logo.svg" alt="graphity" width="320" /> <a href="https://github.com/denostack"><img src="https://raw.githubusercontent.com/denostack/images/main/logo.svg" width="160" align="right" /></a>

<p>
  <a href="https://github.com/denostack/graphity/actions"><img alt="Build" src="https://img.shields.io/github/actions/workflow/status/denostack/graphity/ci.yml?branch=main&logo=github&style=flat-square" /></a>
  <a href="https://codecov.io/gh/denostack/graphity"><img alt="Coverage" src="https://img.shields.io/codecov/c/gh/denostack/graphity?style=flat-square" /></a>
  <img alt="License" src="https://img.shields.io/npm/l/graphity.svg?style=flat-square" />
  <img alt="Language Typescript" src="https://img.shields.io/badge/language-Typescript-007acc.svg?style=flat-square" />
  <br />
  <a href="https://jsr.io/@denostack/graphity"><img alt="JSR version" src="https://jsr.io/badges/@denostack/graphity?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/graphity"><img alt="NPM Version" src="https://img.shields.io/npm/v/graphity.svg?style=flat-square&logo=npm" /></a>
  <a href="https://npmcharts.com/compare/graphity?minimal=true"><img alt="Downloads" src="https://img.shields.io/npm/dt/graphity.svg?style=flat-square" /></a>
</p>

**Graphity** is a library that makes typescript and GraphQL easy to use. As much as possible, the object of
[GraphQL.js](https://github.com/graphql/graphql-js) can be used as it is.

## Projects

- [@graphity/server-express](./packages/graphity-server-express) - Using Graphity on Express Server
- [@graphity/server-lambda](./packages/graphity-server-lambda) - Using Graphity on AWS Lambda

## Installation

Currently, **Graphity** is only responsible for the Schema of GraphQL and can be run through
[Apollo Server](https://github.com/apollographql/apollo-server).

```
npm i graphity apollo-server
```
