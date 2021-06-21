# CHANGELOG

## v1.5.28 [#22](https://github.com/interviewstreet/firepad-x/pull/22)
  ### Fixes -
  - More `null` check for cursor before invoking `equals` method.

## v1.5.27
  ### Fixes -
  - Add `null` check for cursor before invoking `equals` method.

## v1.5.26 [#21](https://github.com/interviewstreet/firepad-x/pull/21)
  ### Fixes -
  - Sync Cursor with timeout in case of delayed initialisation.
  - Persist Cursor information even after disposition.
  - Maintain `sync` state on Cursor in Editor Client.
  - Trigger `error` event if a valid Edit Operation transaction fails any reason other than client disconnection.
  - Make default options of Firepad Constructor functions to allow lazy evaluation.

## v1.5.25 [#20](https://github.com/interviewstreet/firepad-x/pull/20)
  ### Fixes -
  - Remove Data Type Validation for Operation Actor (`op.a`) so that number can used as User ID.

## v1.5.24 [#19](https://github.com/interviewstreet/firepad-x/pull/19)
  ### Fixes -
  - Send actual operation in strigified version on event-bus for `undo` and `redo` operation.

## v1.5.23 [#18](https://github.com/interviewstreet/firepad-x/pull/18)
  ### Fixes -
  - Stop selecting text after first initialisation. Move cursor to begining after `setText` call.

## v1.5.22 [#17](https://github.com/interviewstreet/firepad-x/pull/17)
  ### Improvements -
  - Added Undo annd Redo event to EditorClient to assign event listener.

  ### Changes -
  - Moved Firebase into peer dependency.

## v1.5.21 [#16](https://github.com/interviewstreet/firepad-x/pull/16)
  ### Fixes -
  - Downgrade Firebase to 7.12 to avoid issues with Database.

## v1.5.20 [#15](https://github.com/interviewstreet/firepad-x/pull/15)
  ### Fixes -
  - Model Change Event Handling when no Model Content has changed.

  ### Improvements -
  - Move `jsdom` to devDependency of the project.
  - Improve build step to optimize output chunk.
