# CHANGELOG

<!--
Read this section if it's your first time writing changelog, if not read anyway.

Guidelines:
- Don't dump commit log diffs as changelogs. Bad idea, it is.
- Changelogs are for humans, not machines.
- There should be an entry for every single version.
- The same types of changes should be grouped.
- the latest version comes first.

Tags:
- Added: for new features.
- Changed: for changes in existing functionality.
- Deprecated: for soon-to-be removed features.
- Removed: for now removed features.
- Fixed: for any bug fixes.
- Security: in case of vulnerabilities.

Good to have: commit or PR links.

-->

## v0.3.1 [#44](https://github.com/interviewstreet/firepad-x/pull/44)

### Changed

- Bump version of `@operational-transformation` packages to `v0.1.1`.
- This fixes [issue](https://github.com/interviewstreet/firepad-x/issues/43) with Universal Application building using this library.

## v0.3.0 [#42](https://github.com/interviewstreet/firepad-x/pull/42)

### Changed

- Moved OT Responsibility to 3rd Party Libs under `@operational-transformation` scope.
- Using `mitt` for even emitter.
- Remove unused modules and simplify implementations.
- No breaking change on API level.

## v0.2.0 [#35](https://github.com/interviewstreet/firepad-x/pull/35)

### Changed

- Updated peer dependency from `firebase@7.12.0` to `firebase@8.8.1`.
- No breaking change on API level.
- Improve `README.md` with a beginner friendly guide as well.

### Fixes

- Fixed the issue when using firebase from regions other than US would throw [error](https://stackoverflow.com/a/66387384/8556127).
  [solution](https://stackoverflow.com/questions/64545862/upgrade-to-firebase-js-8-0-0-attempted-import-error-app-is-not-exported-from/64545863).

## v0.1.1 - [#30](https://github.com/interviewstreet/firepad-x/pull/24)

### Fixes

- EOL Reset in Monaco Model content due to `setValue` call in `setInitiated` method, changed it to use existing `setText` call in Monaco Adapter.

## v0.1.0 - [#24](https://github.com/interviewstreet/firepad-x/pull/24)

### Added

- Cursor Widget that announces User's name in front of his/her cursor.
- Github Action workflow to relase package seamlessly to NPM public Registry.
- Support for separate Stable and Beta release to accomodate users for their specific usecases.

### Changed

- Renamed package from `firepad-x` to `@hackerrank/firepad`.
- Migrated codebase to Typescript with emphasis upon Adapter Pattern (Hexagonal Architecture).
- Exposed multiple interfaces to allow each moving parts to work sustainably without actually depending on them.
- Interfaces also allows consumer application to put forward custom implementation of part of the product.
- Migrated Build Environment to TypeScript-Webpack to facilitate for easier development experience wih hot-reloading and other features.
- Build Environment produces ES Modules and Type Definition files along with existing Single JavaScript bundle.
- Migrated Test Setup and Environment to Jest with Coverage report from Istanbul.
- Moved Firebase Configuration to Runtime Environment to allow seamless customisation.
- Added pre-commit hook with Prettier to maintain code quality.

### Removed

- Grunt workflow is removed with all it's dependencies.
- Removed unused modules and examples except for Firebase and Monaco related ones.
