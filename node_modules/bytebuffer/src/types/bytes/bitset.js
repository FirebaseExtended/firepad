/**
 * Writes the array as a bitset.
 * @param {Array<boolean>} value Array of booleans to write
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `length` if omitted.
 * @returns {!ByteBuffer}
 * @expose
 */
ByteBufferPrototype.writeBitSet = function(value, offset) {
  //? RELATIVE()  
  if (!this.noAssert) {
    if (!(value instanceof Array))
      throw TypeError("Illegal BitSet: Not an array");
    //? ASSERT_OFFSET();
  }

  var start = offset,
      bits = value.length,
      bytes = (bits >> 3),
      bit = 0,
      k;

  offset += this.writeVarint32(bits,offset);

  while(bytes--) {
    k = (!!value[bit++] & 1) |
        ((!!value[bit++] & 1) << 1) |
        ((!!value[bit++] & 1) << 2) |
        ((!!value[bit++] & 1) << 3) |
        ((!!value[bit++] & 1) << 4) |
        ((!!value[bit++] & 1) << 5) |
        ((!!value[bit++] & 1) << 6) |
        ((!!value[bit++] & 1) << 7);
    this.writeByte(k,offset++);
  }

  if(bit < bits) {
    var m = 0; k = 0;
    while(bit < bits) k = k | ((!!value[bit++] & 1) << (m++));
    this.writeByte(k,offset++);
  }

  if (relative) {
    this.offset = offset;
    return this;
  }
  return offset - start;
}

/**
 * Reads a BitSet as an array of booleans.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `length` if omitted.
 * @returns {Array<boolean>
 * @expose
 */
ByteBufferPrototype.readBitSet = function(offset) {
  //? RELATIVE()  

  var ret = this.readVarint32(offset),
      bits = ret.value,
      bytes = (bits >> 3),
      bit = 0,
      value = [],
      k;

  offset += ret.length;

  while(bytes--) {
    k = this.readByte(offset++);
    value[bit++] = !!(k & 0x01);
    value[bit++] = !!(k & 0x02);
    value[bit++] = !!(k & 0x04);
    value[bit++] = !!(k & 0x08);
    value[bit++] = !!(k & 0x10);
    value[bit++] = !!(k & 0x20);
    value[bit++] = !!(k & 0x40);
    value[bit++] = !!(k & 0x80);
  }

  if(bit < bits) {
    var m = 0;
    k = this.readByte(offset++);
    while(bit < bits) value[bit++] = !!((k >> (m++)) & 1);
  }

  if (relative) {
    this.offset = offset;
  }
  return value;
}
