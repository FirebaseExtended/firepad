{Range} = require 'atom'

firepad = {} unless firepad?

firepad.AtomAdapter = class AtomAdapter
  ignoreChanges: false

  constructor: (@atom) ->
    @buffer = @atom.buffer
    @grabDocumentState()
    @buffer.on 'changed', @onChange
    #on 'blur', @trigger 'blur' if selection.isEmpty()
    #on 'focus', @trigger 'cursorActivity'
    #on 'changeCursor',  @trigger 'cursorActivity'

  grabDocumentState: ->
    @lastDocState = @atom.getText()
    @lastDocLines = @buffer.getLines()

  detach: ->
    @buffer.off 'changed'

  onChange: (change) =>
    unless @ignoreChanges
      pair = @operationFromAtomChange change
      @firepadTriggers['change'].apply @, pair
      @grabDocumentState()

  operationFromAtomChange: (change) ->
    current = @buffer.getMaxCharacterIndex()
    start = @buffer.characterIndexForPosition change.newRange.start
    remaining = current - @buffer.characterIndexForPosition change.newRange.end
    operation = new firepad.TextOperation().retain(start).delete(change.oldText).insert(change.newText).retain(remaining);
    inverse = new firepad.TextOperation().retain(start).delete(change.newText).insert(change.oldText).retain(remaining);
    [operation, inverse]

  applyOperationToAtom: (operation) ->
    index = 0
    for op in operation.ops
      if op.isRetain()
        index += op.chars
      else if op.isInsert()
        @buffer.insert @buffer.positionForCharacterIndex(index), op.text
        index += op.text.length
      else if op.isDelete()
        from = @buffer.positionForCharacterIndex index
        to = @buffer.positionForCharacterIndex index + op.chars
        @buffer.delete new Range(from, to)
    @grabDocumentState()

  getValue: ->
    @atom.getText()

  getCursor: ->
    selection = @atom.getLastSelection()
    if selection
      range = selection.getBufferRange()
      start = @buffer.characterIndexForPosition range.start
      end = @buffer.characterIndexForPosition range.end
      return new firepad.Cursor start, end
    cursor = @atom.getCursor()
    index = @buffer.characterIndexForPosition cursor.getBufferPosition()
    new firepad.Cursor index, index

  setCursor: (cursor) ->
    start = @posFromIndex cursor.position
    end = @posFromIndex cursor.selectionEnd
    if cursor.position > cursor.selectionEnd
      [start, end] = [end, start]
    @aceSession.selection.setSelectionRange new @aceRange(start.row, start.column, end.row, end.column)

  setOtherCursor: (cursor, color, clientId) ->

  registerCallbacks: (@firepadTriggers) ->

  applyOperation: (operation) ->
    @ignoreChanges = true unless operation.isNoop()
    @applyOperationToAtom operation
    @ignoreChanges = false

  registerUndo: (undoFn) ->
    @undo = undoFn

  registerRedo: (redoFn) ->
    @redo = redoFn

  invertOperation: (operation) ->
    # TODO: Optimize to avoid copying entire text?
    operation.invert @getValue()
