# Firepad

[![Deployment](https://github.com/interviewstreet/firepad-x/actions/workflows/npm-deploy.yml/badge.svg)](https://github.com/interviewstreet/firepad-x/actions/workflows/npm-deploy.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/ced47d99ff8a6fcf623c/maintainability)](https://codeclimate.com/repos/60cb4682ff69b40116002c66/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/ced47d99ff8a6fcf623c/test_coverage)](https://codeclimate.com/repos/60cb4682ff69b40116002c66/test_coverage)
[![Node Version](https://img.shields.io/node/v/@hackerrank/firepad)](https://nodejs.org)
[![Version](https://img.shields.io/npm/v/@hackerrank/firepad?label=stable&color=%2300)](https://www.npmjs.com/package/@hackerrank/firepad)
[![Beta Version](https://img.shields.io/npm/v/@hackerrank/firepad/beta?label=beta)](https://www.npmjs.com/package/@hackerrank/firepad)
[![Weekly Downloads](https://img.shields.io/npm/dw/@hackerrank/firepad)](https://www.npmjs.com/package/@hackerrank/firepad)
[![Built With](https://img.shields.io/badge/built%20with-webpack-green)](https://webpack.js.org)
[![Tested With](https://img.shields.io/badge/tested%20with-jest-yellowgreen)](https://jestjs.io)
[![Typed With](https://img.shields.io/npm/types/@hackerrank/firepad?label=typed%20with)](https://www.typescriptlang.org)
[![Styled With](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square&label=styled%20with)](https://prettier.io)
[![License](https://img.shields.io/npm/l/@hackerrank/firepad)](LICENSE)
[![Open Issues](https://img.shields.io/github/issues-raw/interviewstreet/firepad-x)](https://github.com/interviewstreet/firepad-x/issues)
[![Closed Issues](https://img.shields.io/github/issues-closed-raw/interviewstreet/firepad-x)](https://github.com/interviewstreet/firepad-x/issues?q=is%3Aissue+is%3Aclosed)
[![Open Pulls](https://img.shields.io/github/issues-pr-raw/interviewstreet/firepad-x)](https://github.com/interviewstreet/firepad-x/pulls)
[![Closed Pulls](https://img.shields.io/github/issues-pr-closed-raw/interviewstreet/firepad-x)](https://github.com/interviewstreet/firepad-x/pulls?q=is%3Apr+is%3Aclosed)
[![Contributors](https://img.shields.io/github/contributors/interviewstreet/firepad-x)](https://github.com/interviewstreet/firepad-x/graphs/contributors)
[![Activity](https://img.shields.io/github/last-commit/interviewstreet/firepad-x?label=most%20recent%20activity)](https://github.com/interviewstreet/firepad-x/pulse)

## History

[Firepad](https://github.com/FirebaseExtended/firepad) was originally developed by [Firebase Team at _Google™_](https://firebase.googleblog.com/2013/04/announcing-firepad-our-open-source.html) to showcase a Serverless and easily configurable Collaborative experience in the year of 2013.

At first it started out with only CodeMirror editor with Rich Text support using [OT](https://en.wikipedia.org/wiki/Operational_transformation) to maintain consistency and concurrency. Over the years, open source contributors across the globe have added support for Ace and more recently Monaco editor, and improved overall product.

## Why this Rewrite was necessary

Over the time, with more editor support the codebase got quite convoluted. And every new commit would increase cognitive complexity exponentially, making it harder for the next person to debug any issue. Also keep in mind, the library was designed when JavaScript language itself was quite in early phase.

In recent years, we have seen web editor and IDE domain being dominated by [Monaco](https://github.com/Microsoft/monaco-editor) editor from _Microsoft™_ and [Theia](https://github.com/eclipse-theia/theia) from _Eclipse Foundation_ respectively. Both of these products are written in [TypeScript](https://www.typescriptlang.org), a modern type-safe language with superset features of JavaScript, with proper engineering and architecture in place.

So it was about time, that same would happen to Firepad, and we just pulled the plug. We have rewritten all the modules and few extras using TypeScript while enhancing earlier implemented [Adapter Pattern](https://en.wikipedia.org/wiki/Adapter_pattern) to integrate with external modules, such as Database _(preferably Firebase)_ and editors _(as of now only Monaco is supported, but PRs are welcomed)_. In this process, we have also made few minor improvments to scale at performance _(e.g., [Treeshaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking))_ and ease of usage while keeping internal modules safe.

## Usage

### Public API

Firepad takes two dependencies, one **Database Adapter** and one **Editor Adapter**, with a custom configuration object like the following:

```ts
import Firepad, { IDatabaseAdapter, IEditorAdapter, IFirepadConstructorOptions } from "@hackerrank/firepad";

const databaseAdapter: IDatabaseAdapter = ...; // Database Adapter instance

const editorAdapter: IEditorAdapter = ...; // Editor Adapter instance

const options: IFirepadConstructorOptions = {
   /** Unique Identifier for current User */
  userId: ..., // string or number
  /** Unique Hexadecimal color code for current User */
  userColor: ..., // string
  /** Name/Short Name of the current User (optional) */
  userName: ..., // string
  /** Default content of Firepad (optional) */
  defaultText: ..., // string
};

const firepad = new Firepad(databaseAdapter, editorAdapter, options);
```

### Monaco as editor

If you use Monaco as an editor, we have an shorthand function `fromMonaco` to provide adapters and the binding out of the box with optional configuration object:

```ts
import { fromMonaco } from "@hackerrank/firepad";

const databaseRef: string | firebase.database.Reference = ...; // Path to Firebase Database or a Reference Object

const editor: monaco.editor.IEditor = ...; // Monaco Editor Instance

const firepad = fromMonaco(databaseRef, editor);
```

### Writing Custom Adapters

To use Firepad with any other Editor, one simply need to write an implementation of Editor Adapter interface for that editor. This can be done like this:

```ts
import { IEditorAdapter } from "@hackerrank/firepad";

class MyEditorAdapter implements IEditorAdapter {
  ...
}
```

Similar thing can be done for Database as well by implementing `IDatabaseAdapter` interface. Keep in mind, you might also need to implement event handlers and event triggers depending upon nature of the adapters.

## Development

We have used [`yarn`](https://yarnpkg.com/) as our package manager through out the project.

We use [`webpack-dev-server`](https://webpack.js.org/configuration/dev-server/) for local development environment and [`webpack`](https://webpack.js.org/api/) for bundling. After installing all the dependencies including all the devDependencies and updating Database (Firebase) configuration, just do `yarn start` to kickoff development server. By default, the dev server opens in `localhost:9000` but this can be configured by passing additional `--port` argument to the start command.

We use [`jest`](https://jestjs.io/docs) as both test runner and test suite to write unit tests. Doing `yarn test` should run all the testcases and publish coverage report.

### Directories

1. [`examples`](examples) - All the working examples are kept and used for manual testing during development.
2. [`src`](src) - Source directory for all the modules.
3. [`test`](test) - Specs directory for all the modules.

## Changelog

See [CHANGELOG](CHANGELOG.md) for more details.

## Contributing

See [CONTRIBUTING GUIDELINES](.github/CONTRIBUTING.md) for more details.

## License

See [LICENSE](LICENSE) for more details.
