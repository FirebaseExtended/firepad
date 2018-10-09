/**
 * Makes sure that this ByteBuffer is backed by a {@link ByteBuffer#buffer} of at least the specified capacity. If the
 *  current capacity is exceeded, it will be doubled. If double the current capacity is less than the required capacity,
 *  the required capacity will be used instead.
 * @param {number} capacity Required capacity
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.ensureCapacity = function(capacity) {
    var current = /*?= CAPACITY */;
    if (current < capacity)
        return this.resize((current *= 2) > capacity ? current : capacity);
    return this;
};

