'use strict';

/**
 * @function getCSS - For Internal Usage Only
 * @param {String} clazz - CSS Class Name
 * @param {String} bgColor - Background Color
 * @param {String} color - Font Color
 * @returns CSS Style Rules according to Parameters
 */
var getCSS = function getCSS(clazz, bgColor, color) {
  return "." + clazz + " {\n  position: relative;\n" +
    "background-color: " + bgColor + ";\n" +
    "border-left: 2px solid " + color + ";\n}";
};

/**
 * @function addStyleRule - For Internal Usage Only
 * @desc Creates style element in document head and pushed all the style rules
 * @param {String} clazz - CSS Class Name
 * @param {String} css - CSS Style Rules
 */
var addStyleRule = function addStyleRule(clazz, css) {
  /** House Keeping */
  if (typeof document === 'undefined' || document === null) {
    return false;
  }

  /** Add style rules only once */
  if (this.addedStyleRules.indexOf(clazz) === -1) {
    var styleElement = document.createElement('style');
    var styleSheet = document.createTextNode(css);
    styleElement.appendChild(styleSheet);
    document.head.appendChild(styleElement);
    this.addedStyleRules.push(clazz);
  }
};

/**
 * Monaco Adapter
 * Create Pipe between Firebase and Monaco Text Editor
 */
var MonacoAdapter = function () {
  /**
   * @constructor MonacoEditor
   * @param {MonacoEditor} monacoInstance - Editor Instance
   * @prop {MonacoEditor} monaco - Monaco Instance passed as Parameter
   * @prop {string[]} lastDocLines - Text for all Lines in the Editor
   * @prop {MonacoSelection} lastCursorRange - Primary Selection of the Editor
   * @prop {function} onChange - Change Event Handler bound Local Object
   * @prop {function} onBlur - Blur Event Handler bound Local Object
   * @prop {function} onFocus - Focus Event Handler bound Local Object
   * @prop {function} onCursorActivity - Cursor Activity Handler bound Local Object
   * @prop {Boolean} ignoreChanges - Should Avoid OnChange Event Handling
   * @prop {MonacoIDisposable} changeHandler - Event Handler for Model Content Change
   * @prop {MonacoIDisposable} didBlurHandler - Event Handler for Focus Lost on Editor Text/Widget
   * @prop {MonacoIDisposable} didFocusHandler - Event Handler for Focus Gain on Editor Text/Widget
   * @prop {MonacoIDisposable} didChangeCursorPositionHandler - Event Handler for Cursor Position Change
   */
  function MonacoAdapter(monacoInstance) {
    /** House Keeping */

    // Make sure this looks like a valid monaco instance.
    if (!monacoInstance || typeof monacoInstance.getModel !== 'function') {
      throw new Error('MonacoAdapter: Incorrect Parameter Recieved in constructor, '
        + 'expected valid Monaco Instance');
    }

    /** Monaco Member Variables */
    const model = this.getModel();
    this.monaco = monacoInstance;
    this.lastDocLines = model ? model.getLinesContent() : [];
    this.lastCursorRange = this.monaco.getSelection();

    /** Monaco Editor Configurations */
    this.callbacks = {};
    this.otherCursors = [];
    this.addedStyleRules = [];
    this.ignoreChanges = false;

    /** Adapter Callback Functions */
    this.onChange = this.onChange.bind(this);
    this.onModelChange = this.onModelChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onCursorActivity = this.onCursorActivity.bind(this);

    this.disposables = [
      this.monaco.onDidChangeModelContent(this.onChange),
      this.monaco.onDidBlurEditorWidget(this.onBlur),
      this.monaco.onDidFocusEditorWidget(this.onFocus),
      this.monaco.onDidChangeCursorPosition(this.onCursorActivity),
      this.monaco.onDidChangeModel(this.onModelChange),
    ];

    this.cursorTimer = null;
    this.originalExecuteCommand = this.monaco._commandService.executeCommand;
    this.monaco._commandService.executeCommand = this.executeCommand.bind(this);
  }

  MonacoAdapter.prototype.getModel = function getModel() {
    return this.monaco.getModel();
  }

  /**
   * @method detach - Clears an Instance of Editor Adapter
   */
  MonacoAdapter.prototype.detach = function detach() {
    this.disposables.forEach(d => d.dispose());
    this.monaco._commandService.executeCommand = this.originalExecuteCommand;
    this.originalExecuteCommand = undefined;
    if (this.cursorTimer) {
      clearTimeout(this.cursorTimer);
    }
  };

  /**
   * @method getValue - Get current value
   * @return string
   */
  MonacoAdapter.prototype.getValue = function() {
    const model = this.getModel();

    if (model) {
      return model.getValue();
    }

    return '';
  }

  /**
   * @method getCursor - Get current cursor position
   * @returns Firepad Cursor object
   */
  MonacoAdapter.prototype.getCursor = function getCursor() {
    var model = this.getModel();

    if (!model) {
      return null;
    }

    var selection = this.monaco.getSelection();

    /** Fallback to last cursor change */
    if (typeof selection === 'undefined' || selection === null) {
      selection = this.lastCursorRange;
    }

    /** Obtain selection indexes */
    var startPos = selection.getStartPosition();
    var endPos = selection.getEndPosition();
    var start = model.getOffsetAt(startPos);
    var end = model.getOffsetAt(endPos);

    /** If Selection is Inversed */
    if (start > end) {
      var _ref = [end, start];
      start = _ref[0];
      end = _ref[1];
    }

    /** Return cursor position */
    return new firepad.Cursor(start, end);
  };

  /**
   * @method setCursor - Set Selection on Monaco Editor Instance
   * @param {Object} cursor - Cursor Position (start and end)
   * @param {Number} cursor.position - Starting Position of the Cursor
   * @param {Number} cursor.selectionEnd - Ending Position of the Cursor
   */
  MonacoAdapter.prototype.setCursor = function setCursor(cursor) {
    var position = cursor.position;
    var selectionEnd = cursor.selectionEnd;
    var model = this.getModel();
    var start = model.getPositionAt(position);
    var end = model.getPositionAt(selectionEnd);

    /** If selection is inversed */
    if (position > selectionEnd) {
      var _ref = [end, start];
      start = _ref[0];
      end = _ref[1];
    }

    /** Create Selection in the Editor */
    this.monaco.setSelection(
      new monaco.Range(
        start.lineNumber, start.column,
        end.lineNumber, end.column
      )
    );
  };

  /**
   * @method setOtherCursor - Set Remote Selection on Monaco Editor
   * @param {Number} cursor.position - Starting Position of the Selection
   * @param {Number} cursor.selectionEnd - Ending Position of the Selection
   * @param {String} color - Hex Color codes for Styling
   * @param {any} clientID - ID number of the Remote Client
   */
  MonacoAdapter.prototype.setOtherCursor = function setOtherCursor(cursor, color, clientID) {
    /** House Keeping */
    if (typeof cursor !== 'object' || typeof cursor.position !== 'number'
      || typeof cursor.selectionEnd !== 'number') {

      return false;
    }

    if (typeof color !== 'string' || !color.match(/^#[a-fA-F0-9]{3,6}$/)) {
      return false;
    }

    /** Extract Positions */
    var position = cursor.position;
    var selectionEnd = cursor.selectionEnd;

    if (position < 0 || selectionEnd < 0) {
      return false;
    }

    /** Fetch Client Cursor Information */
    var otherCursor = this.otherCursors.find(function (cursor) {
      return cursor.clientID === clientID;
    });

    /** Initialize empty array, if client does not exist */
    if (!otherCursor) {
      otherCursor = {
        clientID: clientID,
        decoration: []
      };
      this.otherCursors.push(otherCursor);
    }

    /** Remove Earlier Decorations, if any, or initialize empty decor */
    otherCursor.decoration = this.monaco.deltaDecorations(otherCursor.decoration, []);
    var clazz = "other-client-selection-" + color.replace('#', '');
    var css, ret;

    if (position === selectionEnd) {
      /** Show only cursor */
      clazz = clazz.replace('selection', 'cursor');

      /** Generate Style rules and add them to document */
      css = getCSS(clazz, 'transparent', color);
      ret = addStyleRule.call(this, clazz, css);
    } else {
      /** Generate Style rules and add them to document */
      css = getCSS(clazz, color, color);
      ret = addStyleRule.call(this, clazz, css);
    }

    /** Return if failed to add css */
    if (ret == false) {
      console.log("Monaco Adapter: Failed to add some css style.\n"
      + "Please make sure you're running on supported environment.");
    }

    /** Get co-ordinate position in Editor */
    var model = this.getModel();
    var start = model.getPositionAt(position);
    var end = model.getPositionAt(selectionEnd);

    /** Selection is inversed */
    if (position > selectionEnd) {
      var _ref = [end, start];
      start = _ref[0];
      end = _ref[1];
    }

    /** Add decoration to the Editor */
    otherCursor.decoration = this.monaco.deltaDecorations(otherCursor.decoration,
      [
        {
          range: new monaco.Range(
            start.lineNumber, start.column,
            end.lineNumber, end.column
          ),
          options: {
            className: clazz
          }
        }
      ]
    );

    /** Clear cursor method */
    var _this = this;
    return {
      clear: function clear() {
        otherCursor.decoration = _this.monaco.deltaDecorations(otherCursor.decoration, []);
      }
    };
  };

  /**
   * @method registerCallbacks - Assign callback functions to internal property
   * @param {function[]} callbacks - Set of callback functions
   */
  MonacoAdapter.prototype.registerCallbacks = function registerCallbacks(callbacks) {
    this.callbacks = Object.assign({}, this.callbacks, callbacks);
  };

  /**
   * @method registerUndo
   * @param {function} callback - Callback Handler for Undo Event
   */
  MonacoAdapter.prototype.registerUndo = function registerUndo(callback) {
    if (typeof callback === 'function') {
      this.callbacks.undo = callback;
    } else {
      throw new Error('MonacoAdapter: registerUndo method expects a '
        + 'callback function in parameter');
    }
  };

  /**
   * @method registerRedo
   * @param {function} callback - Callback Handler for Redo Event
   */
  MonacoAdapter.prototype.registerRedo = function registerRedo(callback) {
    if (typeof callback === 'function') {
      this.callbacks.redo = callback;
    } else {
      throw new Error('MonacoAdapter: registerRedo method expects a '
        + 'callback function in parameter');
    }
  };

  /**
   * @method onModelChange - Update firebase data with the new model content
   * @param {Object} event - onModelChange Event Delegate
   */
  MonacoAdapter.prototype.onModelChange = function onModelChange(event) {
    const newModel = this.getModel();
    const oldLinesCount = this.lastDocLines.length;
    const oldLastColumLength = this.lastDocLines[oldLinesCount - 1].length;
    const oldRange = new monaco.Range(1, 1, oldLinesCount, oldLastColumLength + 1);
    const oldValue = this.getPreviousContentInRange();

    this.onChange({
      changes: [{
        range: oldRange,
        rangeOffset: 0,
        rangeLength: oldValue.length,
        text: newModel.getValue(),
      }],
    });
  };

  MonacoAdapter.prototype.getPreviousContentInRange = function getPreviousContentInRange(range) {
    const model = this.getModel();
    const eol = model ? model.getEOL() : '\n';

    if (!range) {
      return this.lastDocLines.join(eol);
    }

    if (range.isEmpty()) {
      return '';
    }

    let val = '';
    const { startLineNumber, startColumn, endLineNumber, endColumn } = range;

    for (let i = startLineNumber; i <= endLineNumber; i++) {
      const line = this.lastDocLines[i - 1];
      if (i === startLineNumber) {
        if (i === endLineNumber) {
          return line.slice(startColumn - 1, endColumn - 1);
        }
        val += line.slice(startColumn - 1) + eol;
      } else if (i === endLineNumber) {
        val += line.slice(0, endColumn - 1);
      } else {
        val += line + eol;
      }
    }

    return val;
  };

  /**
   * @method onChange - OnChange Event Handler
   * @param {Object} event - OnChange Event Delegate
   */
  MonacoAdapter.prototype.onChange = function onChange(event) {
    const model = this.getModel();
    const content = this.getPreviousContentInRange();
    const contentLength = content.length;

    // Ignore if change is being applied by firepad itself.
    if (this.ignoreChanges) {
      return;
    }

    /** If no change information received */
    if (!event.changes || !event.changes.length) {
      const op = new firepad.TextOperation().retain(contentLength);
      this.trigger('change', op, op);
      return;
    }

    const { changes } = event;
    const [ mainOp, reverseOp ] = this.operationFromMonacoChange(changes, contentLength);
    this.trigger.call(this, 'change', mainOp, reverseOp);
    /** Cache current content to use during next change trigger */
    this.lastDocLines = model.getLinesContent();
  };

  MonacoAdapter.prototype.operationFromMonacoChange = function (changes, contentLength) {
    let mainOp = new firepad.TextOperation();
    let reverseOp = new firepad.TextOperation();

    if (changes.length > 1) {
      const first = changes[0];
      const last = changes[changes.length - 1];

      if (first.rangeOffset > last.rangeOffset) {
        changes = changes.reverse();
      }
    }

    let skippedChars = 0;

    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      const { range, text, rangeOffset, rangeLength } = change;
      const retain = rangeOffset - skippedChars;

      mainOp = mainOp.retain(retain);
      reverseOp = reverseOp.retain(retain);

      if (!text && !range.isEmpty()) {
        mainOp = mainOp.delete(rangeLength);
        reverseOp = reverseOp.insert(this.getPreviousContentInRange(range));
      } else if (text && !range.isEmpty()) {
        mainOp = mainOp.delete(rangeLength).insert(text);
        reverseOp = reverseOp.insert(this.getPreviousContentInRange(range)).delete(text.length);
      } else {
        mainOp = mainOp.insert(text);
        reverseOp = reverseOp.delete(text.length);
      }

      skippedChars = skippedChars + retain + rangeLength;
    }

    mainOp = mainOp.retain(contentLength - skippedChars);
    reverseOp = reverseOp.retain(contentLength - skippedChars);
    return [ mainOp, reverseOp ];
  };

  /**
   * @method trigger - Event Handler
   * @param {string} event - Event name
   * @param  {...any} args - Callback arguments
   */
  MonacoAdapter.prototype.trigger = function trigger(event) {
    if (!this.callbacks.hasOwnProperty(event)) {
      return;
    }

    var action = this.callbacks[event];

    if (! typeof action === 'function') {
      return;
    }

    var args = [];

    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
    }

    action.apply(null, args);
  };

  /**
   * @method onBlur - Blur event handler
   */
  MonacoAdapter.prototype.onBlur = function onBlur() {
    if (this.monaco.getSelection().isEmpty()) {
      this.trigger('blur');
    }
  };

  /**
   * @method onFocus - Focus event handler
   */
  MonacoAdapter.prototype.onFocus = function onFocus() {
    this.trigger('focus');
  };

  /**
   * @method onCursorActivity - CursorActivity event handler
   */
  MonacoAdapter.prototype.onCursorActivity = function onCursorActivity() {
    var _this = this;

    this.cursorTimer = setTimeout(function () {
      return _this.trigger('cursorActivity');
    }, 1);
  };

  /**
   * @method applyOperation
   * @param {Operation} operation - OT.js Operation Object
   */
  MonacoAdapter.prototype.applyOperation = function applyOperation(operation) {
    if (!operation.isNoop()) {
      this.ignoreChanges = true;
    }

    /** Get Operations List */
    const opsList = operation.ops;
    let index = 0;
    const model = this.getModel();

    var _this = this;
    const changes = [];

    opsList.forEach(function (op) {
      /** Retain Operation */
      if (op.isRetain()) {
        index += op.chars;
      } else if (op.isInsert()) {
        /** Insert Operation */
        var pos = model.getPositionAt(index);
        changes.push({
          range: new monaco.Range(
            pos.lineNumber, pos.column,
            pos.lineNumber, pos.column
          ),
          text: op.text,
          forceMoveMarkers: true
        });
        // index += op.text.length;
      } else if (op.isDelete()) {
        /** Delete Operation */
        var from = model.getPositionAt(index);
        var to = model.getPositionAt(index + op.chars);

        changes.push({
          range: new monaco.Range(
            from.lineNumber, from.column,
            to.lineNumber, to.column
          ),
          text: '',
          forceMoveMarkers: true
        });
        index += op.chars;
      }
    });

    if (changes.length) {
      let readOnly;

      if (typeof this.monaco.getConfiguration === 'function') {
        ({ readOnly } = this.monaco.getConfiguration());
      } else {
        readOnly = this.monaco.getOption(monaco.editor.EditorOption.readOnly);
      }

      if (readOnly) {
        this.monaco.updateOptions({ readOnly: false });
      }

      this.monaco.executeEdits('firepad', changes);

      if (readOnly) {
        this.monaco.updateOptions({ readOnly });
      }
    }

    /** Update Editor Content and Reset Config */
    if (model) {
      this.lastDocLines = model.getLinesContent();
    }

    this.ignoreChanges = false;
  };

  /**
   * @method invertOperation
   * @param {Operation} operation - OT.js Operation Object
   */
  MonacoAdapter.prototype.invertOperation = function invertOperation(operation) {
    return operation.invert(this.getValue());
  };

  MonacoAdapter.prototype.executeCommand = function() {
    const args = Array.prototype.slice.call(arguments);
    const command = args[0];

    if (args.length && (command === 'undo' || command === 'redo') && this.callbacks[command]) {
      this.callbacks[command]();
      return Promise.resolve();
    }

    return this.originalExecuteCommand.apply(this.monaco._commandService, args);
  };

  return MonacoAdapter;
}(); /** Export Module */


firepad.MonacoAdapter = MonacoAdapter;
