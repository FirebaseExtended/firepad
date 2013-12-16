require 'rest-client'
require 'json'

# usage: Firepad.load 'coderpad.firebaseio.com/111111'
# => 'contents of the last revision of your firepad'

module Firepad
  def self.load base_url
    resp = RestClient.get "https://#{base_url}/history.json"
    resp = JSON.parse resp
    ops = resp.sort.map { |key, op| TextOperation.fromJSON op['o'] }
    ops.inject('') { |prev, cur| cur.apply prev }
  end

  class TextOp
    attr_accessor :type, :chars, :text

    # Operation are essentially lists of ops. There are three types of ops:
    #
    # * Retain ops: Advance the cursor position by a given number of characters.
    #   Represented by positive ints.
    # * Insert ops: Insert a given string at the current cursor position.
    #   Represented by strings.
    # * Delete ops: Delete the next n characters. Represented by negative ints.
    def initialize (type, arg)
      @type = type
      case type
      when 'insert'
        @text = arg.to_s
      when 'delete'
        @chars = arg.to_i
      when 'retain'
        @chars = arg.to_i
      end
    end

    def isInsert
      @type == "insert"
    end

    def isDelete
      @type == "delete"
    end

    def isRetain
      @type == "retain"
    end
  end

  # Constructor for new operations.
  class TextOperation

    def initialize
      @ops = []
      @baseLength = 0
      @targetLength = 0
    end

    def retain n
      raise "retain expects a positive integer." if !n.is_a?(Fixnum) or n < 0
      return self if n == 0
      @baseLength += n
      @targetLength += n
      prevOp = @ops.length > 0 ? @ops[@ops.length - 1] : nil
      if prevOp and prevOp.isRetain()
        prevOp.chars += n
      else
        @ops.push TextOp.new("retain", n)
      end
      self
    end

    def insert str
      raise "insert expects a string" unless str.is_a? String
      return self if str == ""
      @targetLength += str.length
      prevOp = @ops.length > 0 ? @ops[@ops.length - 1] : nil
      prevPrevOp = @ops.length > 1 ? @ops[@ops.length - 2] : nil
      if prevOp and prevOp.isInsert()
        prevOp.text += str
      elsif prevOp and prevOp.isDelete()
        if prevPrevOp and prevPrevOp.isInsert()
          prevPrevOp.text += str
        else
          @ops[@ops.length - 1] = TextOp.new("insert", str)
          @ops.push prevOp
        end
      else
        @ops.push TextOp.new("insert", str)
      end
      self
    end

    def delete n
      n = n.length if n.is_a? String
      raise "delete expects a positive integer or a string" if !n.is_a?(Fixnum) or n < 0
      return self if n == 0
      @baseLength += n
      prevOp = @ops.length > 0 ? @ops[@ops.length - 1] : nil
      if prevOp and prevOp.isDelete()
        prevOp.chars += n
      else
        @ops.push TextOp.new("delete", n)
      end
      self
    end

    def self.fromJSON ops
      o = TextOperation.new

      ops.each do |op|
        if op.is_a? Fixnum
          if op > 0
            o.retain op
          else
            o.delete -op
          end
        else
          o.insert op
        end
      end
      o
    end

    def apply str
      raise "The operation's base length must be equal to the string's length." if str.length != @baseLength
      newStringParts = []
      k = nil
      oldIndex = 0
      ops = @ops
      i = 0
      l = ops.length

      while i < l
        op = ops[i]
        if op.isRetain()
          raise "Operation can't retain more characters than are left in the string." if oldIndex + op.chars > str.length
          newStringParts.push str[oldIndex, op.chars]
          oldIndex += op.chars
        elsif op.isInsert()
          newStringParts.push op.text
        else
          oldIndex += op.chars
        end
        i += 1
      end
      raise "The operation didn't operate on the whole string." if oldIndex != str.length
      newStringParts.join('')
    end
  end
end