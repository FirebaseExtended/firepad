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
    # Doing it how CodeMirrorAdapter does, but this is a bit weird; cursor pos isn't the same as selection start. Will have to implement setOtherCursor before I figure out of this makes sense.
    cursorIndex = @indexFromPos @ace.getCursorPosition()
    selectionEndIndex = @indexFromPos @aceSession.selection.getRange().end
    new firepad.Cursor cursorIndex, selectionEndIndex

  setCursor: (cursor) ->
    @aceRange ?= (ace.require ? require)("ace/range").Range
    start = @posFromIndex cursor.position
    end = @posFromIndex cursor.selectionEnd
    @aceSession.selection.setSelection new @aceRange(start, end)
    #@ace.moveCursorTo @posFromIndex(cursor.position)

  setOtherCursor: (cursor, color, clientId) ->
    # TODO

  registerCallbacks: (@callbacks) ->

  trigger: (event, args...) ->
    @callbacks?[event]?.apply @, args

  applyOperation: (operation) ->
    @ignoreChanges = true unless operation.isNoop()
    @applyOperationToACE operation
    @ignoreChanges = false

  registerUndo: (undoFn) ->
    @ace.undo = undoFn

  registerRedo: (redoFn) ->
    @ace.redo = redoFn

  invertOperation: (operation) ->
    # TODO: Optimize to avoid copying entire text?
    operation.invert @getValue()
