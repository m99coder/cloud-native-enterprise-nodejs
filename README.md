# TypeScript in Visual Studio Code

> <https://code.visualstudio.com/docs/typescript/typescript-tutorial>
> <https://code.visualstudio.com/docs/typescript/typescript-compiling>
> <https://code.visualstudio.com/docs/typescript/typescript-debugging>

## Keyboard Shortcuts

- `⇧⌘M`: Problems panel
- `⌘.`: Quick fix menu
- `F5`: Start debugger (when source file is selected)
- `⇧⌘D`: Debug view
- `⇧⌘B`: Run build task (default task is defined in `.vscode/tasks.json`)

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
