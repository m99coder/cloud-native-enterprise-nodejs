# TypeScript in Visual Studio Code

> <https://code.visualstudio.com/docs/typescript/typescript-tutorial>
> <https://code.visualstudio.com/docs/typescript/typescript-compiling>
> <https://code.visualstudio.com/docs/typescript/typescript-debugging>

## Keyboard Shortcuts

Views

| Shortcut | Functionality  |
| -------- | -------------- |
| `⇧⌘E`    | Explorer       |
| `⇧⌘F`    | Search         |
| `⇧⌘G`    | Source control |
| `⇧⌘D`    | Run and debug  |

Panels

| Shortcut | Functionality     |
| -------- | ----------------- |
| `⇧⌘M`    | Problems          |
| `⇧⌘U`    | Output            |
| `⇧⌘Y`    | Debug output      |
| `⌘J`     | Toggle panel view |

Miscellaneous

| Shortcut | Functionality                                                                       |
| -------- | ----------------------------------------------------------------------------------- |
| `⌘.`     | Quick fix menu                                                                      |
| `F5`     | Start debugger (when source file is selected and a launch configuration is present) |
| `⇧⌘B`    | Run build task                                                                      |

NPM script running was added with VSCode 1.23 and is briefly explained [here](https://code.visualstudio.com/updates/v1_23#_npm-script-running).

## Useful Settings

Exclude JavaScript files generated from TypeScript files:

```json
{
  "files.exclude": {
    "**/*.js": { "when": "$(basename).ts" },
    "**/**.js": { "when": "$(basename).tsx" }
  }
}
```

To enable JavaScript inside a TypeScript project, set `allowJs` property to `true` in the `tsconfig.json`.

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

## Fastify

The Fastify web framework comes bundled with Pino by default, as described [here](https://github.com/pinojs/pino/blob/master/docs/web.md#fastify). A pretty-printed variant can be achieved by piping stdout to [pino-pretty](https://github.com/pinojs/pino-pretty):

```shell
npm i -g pino-pretty
npm run dev | pino-pretty
```

Jay Wolfe has some nice blog posts about using Fastify the right way:

- [Setup Your Fastify Server With Logging The Right Way - No More Express](https://jaywolfe.dev/setup-your-fastify-server-with-logging-the-right-way-no-more-express-2/)
- [Setup A Fastify App with Jest Tests the Right Way](https://jaywolfe.dev/setup-a-fastify-app-with-jest-tests-the-right-way/)
