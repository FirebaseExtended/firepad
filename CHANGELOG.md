# CHANGELOG
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
  - Model Change Evennt Hanndling when no Model Content has changed.

  ### Improvements -
  - Move `jsdom` to devDependency of the project.
  - Improve build step to optimize output chunk.
