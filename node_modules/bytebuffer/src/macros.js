//?...
// Welcome to the crazy world of MetaScript! Tell it what you need, it will not moan, and there it is.

// Substitute for the backing buffer's capacity
CAPACITY = NODE ? 'this.buffer.length' : 'this.buffer.byteLength';

// Asserts that a variable is an integer
ASSERT_INTEGER = function(varValue, unsigned) {
    if (VERBOSE_MS) writeln(__+'// <ASSERT_INTEGER>');
    if (INLINE) {
        writeln(__+'if (typeof '+varValue+' !== \'number\' || '+varValue+' % 1 !== 0)');
        writeln(__+'    throw TypeError("Illegal '+varValue+': "+'+varValue+'+" (not an integer)");');
        writeln(__+varValue+' '+(unsigned ? '>>>' : '|')+'= 0;');
    } else {
        writeln(__+varValue+' = assertInteger('+varValue+(typeof unsigned !== 'undefined' ? ', '+unsigned : '')+');');
    }
    if (VERBOSE_MS) writeln(__+'// </ASSERT_INTEGER>');
};

// Asserts that a variable is a number or Long
ASSERT_LONG = function(varValue, unsigned) {
    if (typeof varValue === 'undefined') varValue = 'value';
    if (VERBOSE_MS) writeln(__+'// <ASSERT_LONG>');
    if (INLINE) {
        writeln(__+'if (typeof '+varValue+' === \'number\')');
        writeln(__+'    '+varValue+' = Long.fromNumber('+varValue+');');
        writeln(__+'else if (typeof '+varValue+' === \'string\')');
        writeln(__+'    '+varValue+' = Long.fromString('+varValue+');');
        if (typeof unsigned !== 'undefined') { // When explicitly specified only
            writeln(__+'else if ('+varValue+' && '+varValue+' instanceof Long)');
            if (unsigned) {
                writeln(__+'    if (!'+varValue+'.unsigned) '+varValue+' = '+varValue+'.toUnsigned();');
            } else {
                writeln(__+'    if ('+varValue+'.unsigned) '+varValue+' = '+varValue+'.toSigned();');
            }
            writeln(__+'else');
        } else {
            writeln(__+'else if (!('+varValue+' && '+varValue+' instanceof Long))');
        }
        writeln(__+'    throw TypeError("Illegal '+varValue+': "+'+varValue+'+" (not an integer or Long)");');
    } else {
        writeln(__+varValue+' = assertLong('+varValue+(typeof unsigned !== 'undefined' ? ', '+unsigned : '')+');');
    }
    if (VERBOSE_MS) writeln(__+'// </ASSERT_LONG>');
};

// Casts a variable to a Long if necessary
LONG = function(varValue, unsigned) {
    if (typeof varValue === 'undefined') varValue = 'value';
    if (VERBOSE_MS) writeln(__+'// <LONG'+(typeof unsigned === 'boolean' ? ' unsigned='+unsigned : '')+'>');
    writeln(__+'if (typeof '+varValue+' === \'number\')');
    writeln(__+'    '+varValue+' = Long.fromNumber('+varValue+(typeof unsigned === 'boolean' ? ', '+unsigned : '')+');');
    writeln(__+'else if (typeof '+varValue+' === \'string\')');
    writeln(__+'    '+varValue+' = Long.fromString('+varValue+(typeof unsigned === 'boolean' ? ', '+unsigned : '')+');');
    if (typeof unsigned === 'boolean') {
        writeln(__+'else if ('+varValue+'.unsigned !== '+unsigned+') '+varValue+' = '+varValue+'.'+(unsigned ? 'toUnsigned' : 'toSigned')+'();');
    }
    if (VERBOSE_MS) writeln(__+'// </LONG>');
};

// Asserts that an offset is valid
ASSERT_OFFSET = function(size, varOffset) {
    if (typeof size      === 'undefined') size      = 0;
    if (typeof varOffset === 'undefined') varOffset = 'offset';
    if (VERBOSE_MS) writeln(__+'// <ASSERT_OFFSET>');
    if (INLINE) {
        writeln(__+'if (typeof '+varOffset+' !== \'number\' || '+varOffset+' % 1 !== 0)');
        writeln(__+'    throw TypeError("Illegal '+varOffset+': "+'+varOffset+'+" (not an integer)");');
        writeln(__+varOffset+' >>>= 0;');
        writeln(__+'if ('+varOffset+' < 0 || '+varOffset+' + '+size+' > '+CAPACITY+')');
        writeln(__+'    throw RangeError("Illegal '+varOffset+': 0 <= "+'+varOffset+'+" (+"+'+size+'+") <= "+'+CAPACITY+');');
    } else {
        writeln(__+varOffset+' = assertOffset('+varOffset+', 0, '+CAPACITY+', '+size+');');
    }
    if (VERBOSE_MS) writeln(__+'// </ASSERT_OFFSET>');
};

// Asserts that a range is valid
ASSERT_RANGE = function(varBegin, varEnd) {
    if (typeof varBegin === 'undefined') varBegin = 'begin';
    if (typeof varEnd   === 'undefined') varEnd   = 'end';
    if (VERBOSE_MS) writeln(__+'// <ASSERT_RANGE>');
    if (INLINE) {
        writeln(__+'if (typeof '+varBegin+' !== \'number\' || '+varBegin+' % 1 !== 0)');
        writeln(__+'    throw TypeError("Illegal '+varBegin+': Not an integer");');
        writeln(__+varBegin+' >>>= 0;');
        writeln(__+'if (typeof '+varEnd+' !== \'number\' || '+varEnd+' % 1 !== 0)');
        writeln(__+'    throw TypeError("Illegal '+varEnd+': Not an integer");');
        writeln(__+varEnd+' >>>= 0;');
        writeln(__+'if ('+varBegin+' < 0 || '+varBegin+' > '+varEnd+' || '+varEnd+' > '+CAPACITY+')');
        writeln(__+'    throw RangeError("Illegal range: 0 <= "+'+varBegin+'+" <= "+'+varEnd+'+" <= "+'+CAPACITY+');');
    } else {
        writeln(__+'assertRange('+varBegin+', '+varEnd+', 0, '+CAPACITY+');');
        writeln(__+varBegin+' = rangeVal[0]; '+varEnd+' = rangeVal[1];');
    }
    if (VERBOSE_MS) writeln(__+'// </ASSERT_RANGE>');
};

// ENSURE_CAPACITY counter in case that multiple calls are used in a single method
var ECN = 0;

// Ensures that a ByteBuffer is backed by a buffer that takes `size` additional capacity
ENSURE_CAPACITY = function(size, varOffset) {
    if (typeof varOffset === 'undefined') varOffset = 'offset';
    if (VERBOSE_MS) writeln(__+'// <ENSURE_CAPACITY size='+size+'>');
    if (INLINE) {
        writeln(__+varOffset+' += '+size+';');
        writeln(__+'var capacity'+ECN+' = '+CAPACITY+';');
        writeln(__+'if ('+varOffset+' > capacity'+ECN+')');
        writeln(__+'    this.resize((capacity'+ECN+' *= 2) > '+varOffset+' ? capacity'+ECN+' : '+varOffset+');');
        writeln(__+varOffset+' -= '+size+';');
    } else {
        writeln(__+'this.ensureCapacity('+varOffset+'+'+size+');');
    }
    if (VERBOSE_MS) writeln(__+'// </ENSURE_CAPACITY>');
    ++ECN;
};

// Sets up a relative operation if `size` is omitted, else increases offset by `size`
RELATIVE = function(size, varOffset, varRelOffset) {
    if (VERBOSE_MS) writeln(__+'// <RELATIVE'+(typeof size !== 'undefined' ? ' size='+size : '')+'>');
    if (typeof size === 'undefined') {
        if (typeof varOffset === 'undefined') varOffset = "offset";
        if (typeof varRelOffset === 'undefined') varRelOffset = "this.offset";
        writeln(__+'var relative = typeof '+varOffset+' === \'undefined\';');
        writeln(__+'if (relative) '+varOffset+' = '+varRelOffset+';');
    } else {
        if (typeof varOffset === 'undefined') varOffset = "this.offset";
        writeln(__+'if (relative) this.offset += '+size+';');
    }
    if (VERBOSE_MS) writeln(__+'// </RELATIVE>');
};

// Reads an uint32 from an array
READ_UINT32_ARRAY = function(varValue, varOffset, varTarget, varEndian) {
    if (typeof varValue  === 'undefined') varValue = 'value';
    if (typeof varOffset === 'undefined') varOffset = 'offset';
    if (typeof varTarget === 'undefined') varTarget = NODE ? 'this.buffer' : 'this.view';
    var ____ = typeof varEndian !== 'boolean' ? '    ' : '';
    if (VERBOSE_MS) writeln(__+'// <READ_UINT32'+(typeof varEndian === 'boolean' ? ' le='+varEndian : '')+'>');
    if (NODE || !DATAVIEW) {
        if (typeof varEndian !== 'boolean')
            writeln(__+'if ('+(varEndian || 'this.littleEndian')+') {');
        if (typeof varEndian !== 'boolean' || varEndian === true) {
            writeln(__+____+varValue+'  = '+varTarget+'['+varOffset+'+2] << 16;');
            writeln(__+____+varValue+' |= '+varTarget+'['+varOffset+'+1] <<  8;');
            writeln(__+____+varValue+' |= '+varTarget+'['+varOffset+'  ];');
            writeln(__+____+varValue+' += '+varTarget+'['+varOffset+'+3] << 24 >>> 0;');
        }
        if (typeof varEndian !== 'boolean')
            writeln(__+'} else {');
        if (typeof varEndian !== 'boolean' || varEndian === false) {
            writeln(__+____+varValue+'  = '+varTarget+'['+varOffset+'+1] << 16;');
            writeln(__+____+varValue+' |= '+varTarget+'['+varOffset+'+2] <<  8;');
            writeln(__+____+varValue+' |= '+varTarget+'['+varOffset+'+3];');
            writeln(__+____+varValue+' += '+varTarget+'['+varOffset+'  ] << 24 >>> 0;');
        }
        if (typeof varEndian !== 'boolean')
            writeln(__+'}');
    } else {
        writeln(__+varTarget+'.getUint32('+varOffset+', '+varEndian+');');
    }
    if (VERBOSE_MS) writeln(__+'// </READ_UINT32>');
};

// Writes an uint32 to an array
WRITE_UINT32_ARRAY = function(varValue, varOffset, varTarget, varEndian) {
    if (typeof varValue  === 'undefined') varValue = 'value';
    if (typeof varOffset === 'undefined') varOffset = 'offset';
    if (typeof varTarget === 'undefined') varTarget = NODE ? 'this.buffer' : 'this.view';
    var ____ = typeof varEndian !== 'boolean' ? '    ' : '';
    if (VERBOSE_MS) writeln(__+'// <WRITE_UINT32'+(typeof varEndian === 'boolean' ? ' le='+varEndian : '')+'>');
    if (NODE || !DATAVIEW) {
        if (typeof varEndian !== 'boolean')
            writeln(__+'if ('+(varEndian || 'this.littleEndian')+') {');
        if (typeof varEndian !== 'boolean' || varEndian === true) {
            writeln(__+____+varTarget+'['+varOffset+'+3] = ('+varValue+' >>> 24) & 0xFF;');
            writeln(__+____+varTarget+'['+varOffset+'+2] = ('+varValue+' >>> 16) & 0xFF;');
            writeln(__+____+varTarget+'['+varOffset+'+1] = ('+varValue+' >>>  8) & 0xFF;');
            writeln(__+____+varTarget+'['+varOffset+'  ] =  '+varValue+'         & 0xFF;');
        }
        if (typeof varEndian !== 'boolean')
            writeln(__+'} else {');
        if (typeof varEndian !== 'boolean' || varEndian === false) {
            writeln(__+____+varTarget+'['+varOffset+'  ] = ('+varValue+' >>> 24) & 0xFF;');
            writeln(__+____+varTarget+'['+varOffset+'+1] = ('+varValue+' >>> 16) & 0xFF;');
            writeln(__+____+varTarget+'['+varOffset+'+2] = ('+varValue+' >>>  8) & 0xFF;');
            writeln(__+____+varTarget+'['+varOffset+'+3] =  '+varValue+'         & 0xFF;');
        }
        if (typeof varEndian !== 'boolean')
            writeln(__+'}');
    } else {
        writeln(__+varTarget+'.setUint32('+varValue+', '+varOffset+', '+varEndian+');');
    }
    if (VERBOSE_MS) writeln(__+'// </WRITE_UINT32>');
};

SET = function(varValue, varOffset, varTarget) { // with varTarget referencing a ByteBuffer
    if (typeof varValue  === 'undefined') varValue = 'value';
    if (typeof varOffset === 'undefined') varOffset = 'offset';
    if (typeof varTarget === 'undefined') varTarget = 'this';
    if (NODE) {
        writeln(__+varTarget+'.buffer['+varOffset+'] = '+varValue+';');
    } else if (DATAVIEW) {
        writeln(__+varTarget+'.view.setUint8('+varValue+', '+varOffset+');');
    } else {
        writeln(__+varTarget+'.view['+varOffset+'] = '+varValue+';');
    }
};

GET = function(varOffset, varTarget) { // with varTarget referencing a ByteBuffer
    if (typeof varOffset === 'undefined') varOffset = 'offset';
    if (typeof varTarget === 'undefined') varTarget = 'this';
    if (NODE) {
        write(varTarget+'.buffer['+varOffset+']');
    } else if (DATAVIEW) {
        write(varTarget+'.view.getUint8('+varOffset+')');
    } else {
        write(varTarget+'.view['+varOffset+']');
    }
};
//?.