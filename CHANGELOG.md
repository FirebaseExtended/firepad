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
