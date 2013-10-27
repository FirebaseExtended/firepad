firepad = {} unless firepad?

firepad.ACEAdapter = class ACEAdapter
  ignoreChanges: false

  constructor: (@ace) ->
    @aceSession = @ace.getSession()
    @aceDoc = @aceSession.getDocument()
    @aceDoc.setNewLineMode 'unix'
    @ace.on 'change', @onChange
    @ace.on 'blur', @onBlur
    @ace.on 'focus', @onCursorActivity
    @aceSession.selection.on 'changeCursor', @onCursorActivity

  # Removes all event listeners from the ACE editor instance
  detach: ->
    @ace.removeListener 'change', @onChange
    @ace.removeListener 'blur', @onBlur
    @ace.removeListener 'focus', @onCursorActivity
    @aceSession.selection.removeListener 'changeCursor', @onCursorActivity

  onChange: (change) =>
    unless @ignoreChanges
      pair = @operationFromACEChange change
      @trigger 'change', pair...

  onBlur: =>
    @trigger 'blur' if @ace.selection.isEmpty()

  onCursorActivity: =>
    @trigger 'cursorActivity'

  # Converts an ACE change object into a TextOperation and its inverse
  # and returns them as a two-element array.
  operationFromACEChange: (change) ->
    delta = change.data
    if delta.action in ["insertLines", "removeLines"]
      text = delta.lines.join("\n") + "\n"
      action = delta.action.replace "Lines", ""
    else
      text = delta.text
      action = delta.action.replace "Text", ""
    start = @indexFromPos delta.range.start
    end = @indexFromPos delta.range.end
    restLength = @getValue().length - start
    restLength -= text.length if action is "insert"
    operation = new firepad.TextOperation().retain(start).insert(text).retain(restLength)
    inverse = new firepad.TextOperation().retain(start).delete(text).retain(restLength)
    [operation, inverse] = [inverse, operation] if action is 'remove'
    [operation, inverse]

  # Apply an operation to an ACE instance.
  applyOperationToACE: (operation) ->
    @aceRange ?= (ace.require ? require)("ace/range").Range
    index = 0
    for op in operation.ops
      if op.isRetain()
        index += op.chars
      else if op.isInsert()
        @aceDoc.insert @posFromIndex(index), op.text
        index += op.text.length
      else if op.isDelete()
        from = @posFromIndex index
        to = @posFromIndex index + op.chars
        range = @aceRange.fromPoints from, to
        @aceDoc.remove range

  posFromIndex: (index) ->
    for line, row in @aceDoc.$lines
      break if index <= line.length
      index -= line.length + @aceDoc.$autoNewLine.length
    row: row, column: index

  indexFromPos: (pos) ->
    lines = @aceDoc.$lines
    index = 0
    for i in [0 ... pos.row]
      index += lines[i].length + @aceDoc.$autoNewLine.length
    index += pos.column

  getValue: ->
    @aceDoc.getValue()

  getCursor: ->
    start = @indexFromPos @aceSession.selection.getRange().start
    end = @indexFromPos @aceSession.selection.getRange().end
    if start > end
      [start, end] = [end, start]
    new firepad.Cursor start, end

  setCursor: (cursor) ->
    @aceRange ?= (ace.require ? require)("ace/range").Range
    start = @posFromIndex cursor.position
    end = @posFromIndex cursor.selectionEnd
    if cursor.position > cursor.selectionEnd
      [start, end] = [end, start]
    @aceSession.selection.setSelectionRange new @aceRange(start.row, start.column, end.row, end.column)

  setOtherCursor: (cursor, color, clientId) ->
    @otherCursors ?= {}
    cursorRange = @otherCursors[clientId]
    if cursorRange
      cursorRange.start.detach()
      cursorRange.end.detach()
      @aceSession.removeMarker cursorRange.id
    start = @posFromIndex cursor.position
    end = @posFromIndex cursor.selectionEnd
    if cursor.selectionEnd < cursor.position
      [start, end] = [end, start]
    clazz = "other-client-#{color.replace '#', ''}"
    css = """.#{clazz} {
      background-color: #{color};
      position: absolute;
      border-left: 1px solid green;
      border-right: 1px solid blue;
    }"""
    @addStyleRule css

    @otherCursors[clientId] = cursorRange = new @aceRange start.row, start.column, end.row, end.column
    cursorRange.start = @aceDoc.createAnchor cursorRange.start
    cursorRange.end = @aceDoc.createAnchor cursorRange.end
    cursorRange.id = @aceSession.addMarker cursorRange, clazz, "text"
    # Return something with a clear method to mimic expected API from CodeMirror
    return clear: =>
      cursorRange.start.detach()
      cursorRange.end.detach()
      @aceSession.removeMarker cursorRange.id

  addStyleRule: (css) ->
    return unless document?
    unless @addedStyleRules
      @addedStyleRules = {}
      styleElement = document.createElement 'style'
      document.documentElement.getElementsByTagName('head')[0].appendChild styleElement
      @addedStyleSheet = styleElement.sheet
    return if @addedStyleRules[css]
    @addedStyleRules[css] = true
    @addedStyleSheet.insertRule css, 0

  registerCallbacks: (@callbacks) ->

  trigger: (event, args...) ->
    @callbacks?[event]?.apply @, args

  applyOperation: (operation) ->
    @ignoreChanges = true unless operation.isNoop()
    @applyOperationToACE operation
    @ignoreChanges = false

  registerUndo: (undoFn) ->
    @ace.undo = undoFn  # not tested (what should this do?)

  registerRedo: (redoFn) ->
    @ace.redo = redoFn  # not tested (what should this do?)

  invertOperation: (operation) ->
    # TODO: Optimize to avoid copying entire text?
    operation.invert @getValue()
