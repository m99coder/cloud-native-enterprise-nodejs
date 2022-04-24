# TypeScript in Visual Studio Code

## Configuration

Some formatting settings like format on save using the [ESLint plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) for VSCode:

```json
{
  "editor.formatOnSave": true,
  "editor.formatOnPaste": false,
  "editor.defaultFormatter": "dbaeumer.vscode-eslint",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
  ],
  "files.insertFinalNewline": true
}
```

To support [direnv](https://direnv.net/), everything you need to do is to define an `.envrc` that calls `dotenv` as described [here](https://github.com/direnv/direnv/issues/284#issuecomment-315275436).

## Fastify

The Fastify web framework comes bundled with Pino by default, as described [here](https://github.com/pinojs/pino/blob/master/docs/web.md#fastify). A pretty-printed variant can be achieved by piping stdout to [pino-pretty](https://github.com/pinojs/pino-pretty):

```shell
npm i -g pino-pretty
npm run dev | pino-pretty
```

Jay Wolfe has some nice blog posts about using Fastify the right way:

- [Setup Your Fastify Server With Logging The Right Way - No More Express](https://jaywolfe.dev/setup-your-fastify-server-with-logging-the-right-way-no-more-express-2/)
- [Setup A Fastify App with Jest Tests the Right Way](https://jaywolfe.dev/setup-a-fastify-app-with-jest-tests-the-right-way/)

## Testing

To make use of the coverage report it’s recommended to install the [Jest plugin](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest).

```shell
# run tests
npm test

# run tests and generate coverage report
npm run test:coverage
open coverage/lcov-report/index.html
```

## Running

```shell
# clean compile folder
npm run clean

# compile TypeScript to JavaScript
npm run build

# run application
npm start

# run application in development mode with hot-reloading
npm run dev

# lint sources
npm run lint

# format sources
npm run fmt
```

Environment variables

| Variable    | Type     | Default |
| ----------- | -------- | ------- |
| `LOG_LEVEL` | `string` | `info`  |
| `PORT`      | `number` | 3000    |

## Scaling

> HAProxy is a free and open source software that provides a high availability load balancer and reverse proxy for TCP and HTTP-based applications that spreads requests across multiple servers.

```shell
# start 3 server instances
PORT=3001 npm start
PORT=3002 npm start
PORT=3003 npm start
```

```shell
# install and start HAProxy
brew install haproxy
haproxy -f ./haproxy.cfg
```

```shell
# open the stats dashboard
open http://localhost:8404

# call the API
curl -i http://localhost:3000

# terminate one of the API servers with `kill <pid>`
# HAProxy detects that the API is down
# re-start the API server and HAProxy will include it into load-balancing again
```
