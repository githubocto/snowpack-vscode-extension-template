# snowpack-vscode-extension-template

This is a template for create-snowpack-app which scaffolds a VS Code extension with webviews.

```
npx create-snowpack-app my-vscode-extension --template @githubocto/snowpack-vscode-extension-template
```

## Why does this exist?

The VS Code extension environment comes with a lot of limitations that make it difficult to develop for. Webviews run inside an iframe, and must communicate with the extension via message passing. A strict content security policy is imposed, so that extensions can't go off and do Bad Things™ willy-nilly. There's no such thing as HMR.

While it's still fundamentally web technologies, it's a bear to set up in a fashion that feels like modern web development.

This CSA template offers the following niceties:

- A working Typescript setup for both the extension _and_ the webview.
- A sample react app
- Tailwind CSS for styling, using JIT
- VS Code theme colors exposed as Tailwind colors for ease of "theme-native" styling.
- Lots of little quality-of-life refinements, like a tasks.json which knows to wait for builds to complete before launching the extension host, and css_custom_data.json so that VS Code doesn't complain at you for using `@tailwind` directives in your css.
- … And, of course, Snowpack for the fastest possible builds.

Sadly, incremental builds are not possible with the way that VS Code currently works. That means that each build is effectively "bundling for production" and is executing `snowpack build` for you.

# License

MIT
