# This module requires that a global FIREBASE object is initialized, from the gem
# `firebase` (https://rubygems.org/gems/firebase). If you don't want to do that, it's
# pretty easy to tweak this code to take the FIREBASE object as a param, or even
# to hit the REST endpoints yourself using whatever HTTP client you prefer.
#
# To load the final text value of a pad created through the official JavaScript
# Firepad client, call `Firepad.load "PADNAME"`. This will check for a snapshot,
# then mutate a string in place to produce the final output. We also account for
# JavaScript's shitty string representation (JS expresses the poop emoji as two chars).

module Firepad
  def self.load pad_path
    if checkpoint = FIREBASE.get("#{pad_path}/checkpoint").body
      doc = checkpoint['o'].first
      doc = '' unless doc.is_a? String
      history = FIREBASE.get("#{pad_path}/history", orderBy: '"$key"', startAt: "\"#{checkpoint['id']}\"").body.sort
      history.shift
    else
      doc = ''
      history = FIREBASE.get("#{pad_path}/history").body
      return nil unless history
      history = history.sort
    end

    doc.pad_surrogate_pairs!
    history.each do |_, ops|
      idx = 0
      ops['o'].each do |op|
        if op.is_a? Fixnum
          if op > 0
            # retain
            idx += op
          else
            # delete
            doc.slice! idx, -op
          end
        else
          # insert
          op.pad_surrogate_pairs!
          doc.insert idx, op
          idx += op.length
        end
      end
      raise "The operation didn't operate on the whole string." if idx != doc.length
    end

    doc.delete! "\0".freeze
    doc
  end
end

class String
  def pad_surrogate_pairs!
    offset = 0
    self.each_codepoint.with_index do |codepoint, idx|
      if codepoint >= 0x10000 && codepoint <= 0x10FFFF
        self.insert idx + offset, "\0".freeze
        offset += 1
      end
    end
    self
  end
end
