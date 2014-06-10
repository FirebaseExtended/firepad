var firepad = firepad || { };

firepad.AttributeConstants = {
  BOLD: 'b',
  ITALIC: 'i',
  UNDERLINE: 'u',
  STRIKE: 's',
  FONT: 'f',
  FONT_SIZE: 'fs',
  COLOR: 'c',
  BACKGROUND_COLOR: 'bc',
  ENTITY_SENTINEL: 'ent',

// Line Attributes
  LINE_SENTINEL: 'l',
  LINE_INDENT: 'li',
  LINE_ALIGN: 'la',
  LIST_TYPE: 'lt'
};

firepad.sentinelConstants = {
  // A special character we insert at the beginning of lines so we can attach attributes to it to represent
  // "line attributes."  E000 is from the unicode "private use" range.
  LINE_SENTINEL_CHARACTER:   '\uE000',

  // A special character used to represent any "entity" inserted into the document (e.g. an image).
  ENTITY_SENTINEL_CHARACTER: '\uE001'
};
