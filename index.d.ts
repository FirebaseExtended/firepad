import firebase from 'firebase/app';
import CodeMirror from 'codemirror';
import monaco from 'monaco-editor';
interface BaseOptions {
    // The user ID for the person editing. (default: random)
    userId?: string;
    // A css color (e.g. "#ccc") for this user's cursor. (default: generated from userId)
    userColor?: string;
    // Text to initialize the Firepad with if history is empty. (default: null)
    defaultText?: string | null;
}

interface CodeMirrorOptions extends BaseOptions{
  // Adds a toolbar with buttons for bold, italic, etc. (default: false)
  richTextToolbar?: boolean;
  // Maps Ctrl-B to bold, etc. (default: false)
  richTextShortcuts?: boolean;
}

declare class Firepad {
  constructor(
    firebaseRef: firebase.database.Reference,
    editor: CodeMirror.Editor | monaco.editor.ICodeEditor | any,
    options?: CodeMirrorOptions | BaseOptions,
  );

  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;

  getText: () => string;
  setText: (text: string) => void;
  getHtml: () => string;
  setHtml: (html: string) => void;
  isHistoryEmpty: () => boolean;
  registerEntity: (type: string, options: {[key: string]: any}) => void;
  setUserId: (userId: string) => void;
  setUserColor: (color: string) => void;
  getOption: (option: string, def: any) => any;
  dispose: () => void;

  /* CodeMirror only */
  bold: () => void;
  italic: () => void;
  underline: () => void;
  strike: () => void;
  fontSize: (size: number) => void;
  font: (font: string) => void;
  color: (color: string) => void;
  highlight: () => void;
  align: (alignment: 'left' | 'right' | 'center') => void;
  orderedList: () => void;
  unorderedList: () => void;
  todo: () => void;
  newline: () => void;
  deleteLeft: () => void;
  deleteRight: () => void;
  indent: () => void;
  unindent: () => void;
  undo: () => void;
  redo: () => void;
  insertEntity: (type: string, attributes: {[key: string]: any}, origin: string) => void;
  insertEntityAt: (index: string, type: string, attributes: {[key: string]: any}, origin: string) => void;
}

declare class TextOperation {
  constructor();
  equals: (other: TextOperation) => boolean;
  retain: (n: number, attributes?: {[key: string]: any}) => this;
  insert: (str: string, attributes?: {[key: string]: any}) => this;
  delete: (n: string | number) => this;
  isNoop: () => boolean;
  clone: () => TextOperation;
  toString: () => string;
  toJSON: () => any[];
  fromJSON: (objs: any[]) => void;
  apply: (str: string, oldAttributes?: {[key: string]: any}[], newAttributes?: {[key: string]: any}[]) => string;
  invert: (str: string) => TextOperation;
  compose: (operation2: TextOperation) => TextOperation;
  shouldBeComposedWith: (other: TextOperation) => boolean;
  shouldBeComposedWithInverted: (other: TextOperation) => boolean;

  transform: (other: TextOperation) => [TextOperation, TextOperation];

  static transformAttributes: (attributes1: {[key: string]: any}, attributes2: {[key: string]: any}) => [{[key: string]: any}, {[key: string]: any}];
  static tranform: (operation1: TextOperation, operation2: TextOperation) => [TextOperation, TextOperation];
}

declare namespace Firepad {
  export function fromCodeMirror(firebaseRef: firebase.database.Reference, codeMirror: CodeMirror.Editor, options?: CodeMirrorOptions): Firepad;
  export function fromACE(firebaseRef: firebase.database.Reference, ace: any, options?: BaseOptions): Firepad;
  export function fromMonaco(firebaseRef: firebase.database.Reference, monaco: monaco.editor.ICodeEditor, options?: BaseOptions): Firepad;

  export class Headless {
    constructor(refOrPath: firebase.database.Reference | string);
    getDocument(callback: (document: TextOperation) => void): void;
    getText(callback: (text: string) => void): void;
    setText(text: string, callback?: (err: null, committed: boolean) => void): void;
    getHtml(callback: (html: string) => void): void;
    setHtml: (html: string, callback?: (err: null, committed: boolean) => void) => void;
    dispose(): void;
  }
}

export = Firepad;
