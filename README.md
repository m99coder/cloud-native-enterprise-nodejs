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

# run application on custom port
PORT=4000 npm start

# run application in development mode with hot-reloading
npm run dev

# lint sources
npm run lint

# format sources
npm run fmt
```
