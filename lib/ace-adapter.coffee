firepad = {} unless firepad?

class firepad.ACEAdapter
  ignoreChanges: false

  constructor: (aceInstance) ->
    @ace = aceInstance
    @aceSession = @ace.getSession()
    @aceDoc = @aceSession.getDocument()
    @aceDoc.setNewLineMode 'unix'
    @grabDocumentState()
    @ace.on 'change', @onChange
    @ace.on 'blur', @onBlur
    @ace.on 'focus', @onFocus
    @aceSession.selection.on 'changeCursor', @onCursorActivity
    @aceRange ?= (ace.require ? require)("ace/range").Range

  grabDocumentState: ->
    @lastDocLines = @aceDoc.getAllLines()
    @lastCursorRange = @aceSession.selection.getRange()

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
      @grabDocumentState()

  onBlur: =>
    @trigger 'blur' if @ace.selection.isEmpty()

  onFocus: =>
    @trigger 'focus'

  onCursorActivity: =>
    setTimeout =>
      @trigger 'cursorActivity'
    , 0

  # Converts an ACE change object into a TextOperation and its inverse
  # and returns them as a two-element array.
  operationFromACEChange: (change) ->
    if change.data
      # Ace < 1.2.0
      delta = change.data
      if delta.action in ['insertLines', 'removeLines']
        text = delta.lines.join('\n') + '\n'
        action = delta.action.replace 'Lines', ''
      else
        text = delta.text.replace(@aceDoc.getNewLineCharacter(), '\n')
        action = delta.action.replace 'Text', ''
      start = @indexFromPos delta.range.start
    else
      # Ace 1.2.0+
      text = change.lines.join('\n')
      start = @indexFromPos change.start
    
    restLength = @lastDocLines.join('\n').length - start
    restLength -= text.length if change.action is 'remove'
    insert_op = new firepad.TextOperation().retain(start).insert(text).retain(restLength)
    delete_op = new firepad.TextOperation().retain(start).delete(text).retain(restLength)
    if change.action is 'remove'
      [delete_op, insert_op]
    else
      [insert_op, delete_op]

  # Apply an operation to an ACE instance.
  applyOperationToACE: (operation) ->
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
    @grabDocumentState()

  posFromIndex: (index) ->
    for line, row in @aceDoc.$lines
      break if index <= line.length
      index -= line.length + 1
    row: row, column: index

  indexFromPos: (pos, lines) ->
    lines ?= @lastDocLines
    index = 0
    for i in [0 ... pos.row]
      index += @lastDocLines[i].length + 1
    index += pos.column

  getValue: ->
    @aceDoc.getValue()

  getCursor: ->
    try
      start = @indexFromPos @aceSession.selection.getRange().start, @aceDoc.$lines
      end = @indexFromPos @aceSession.selection.getRange().end, @aceDoc.$lines
    catch e
      # If the new range doesn't work (sometimes with setValue), we'll use the old range
      try
        start = @indexFromPos @lastCursorRange.start
        end = @indexFromPos @lastCursorRange.end
      catch e2
        console.log "Couldn't figure out the cursor range:", e2, "-- setting it to 0:0."
        [start, end] = [0, 0]
    if start > end
      [start, end] = [end, start]
    new firepad.Cursor start, end

  setCursor: (cursor) ->
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
    clazz = "other-client-selection-#{color.replace '#', ''}"
    justCursor = cursor.position is cursor.selectionEnd
    clazz = clazz.replace 'selection', 'cursor' if justCursor
    css = """.#{clazz} {
      position: absolute;
      background-color: #{if justCursor then 'transparent' else color};
      border-left: 2px solid #{color};
    }"""
    @addStyleRule css
    @otherCursors[clientId] = cursorRange = new @aceRange start.row, start.column, end.row, end.column

    # Hack this specific range to, when clipped, return an empty range that
    # pretends to not be empty. This lets us draw markers at the ends of lines.
    # This might be brittle in the future.
    self = this
    cursorRange.clipRows = ->
      range = self.aceRange::clipRows.apply this, arguments
      range.isEmpty = -> false
      range

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
    @ace.undo = undoFn

  registerRedo: (redoFn) ->
    @ace.redo = redoFn

  invertOperation: (operation) ->
    # TODO: Optimize to avoid copying entire text?
    operation.invert @getValue()
