describe('Client', function() {
  var TextOperation = firepad.TextOperation;
  var Client = firepad.Client;

  it('Client', function() {
    var client = new Client();
    expect(client.state instanceof Client.Synchronized).toBe(true);

    var sentOperation = null;
    function getSentOperation () {
      var a = sentOperation;
      if (!a) { throw new Error("sendOperation wasn't called"); }
      sentOperation = null;
      return a;
    }
    client.sendOperation = function (operation) {
      sentOperation = operation;
    };

    var doc = "lorem dolor";
    var appliedOperation = null;
    function getAppliedOperation () {
      var a = appliedOperation;
      if (!a) { throw new Error("applyOperation wasn't called"); }
      appliedOperation = null;
      return a;
    }
    client.applyOperation = function (operation) {
      doc = operation.apply(doc);
      appliedOperation = operation;
    };

    function applyClient (operation) {
      doc = operation.apply(doc);
      client.applyClient(operation);
    }

    client.applyServer(new TextOperation().retain(6)['delete'](1).insert("D").retain(4));
    expect(doc).toBe("lorem Dolor");
    expect(client.state instanceof Client.Synchronized).toBe(true);

    applyClient(new TextOperation().retain(11).insert(" "));
    expect(doc).toBe("lorem Dolor ");
    expect(client.state instanceof Client.AwaitingConfirm).toBe(true);
    expect(client.state.outstanding.equals(new TextOperation().retain(11).insert(" "))).toBe(true);
    expect(getSentOperation().equals(new TextOperation().retain(11).insert(" "))).toBe(true);

    client.applyServer(new TextOperation().retain(5).insert(" ").retain(6));
    expect(doc).toBe("lorem  Dolor ");
    expect(client.state instanceof Client.AwaitingConfirm).toBe(true);
    expect(client.state.outstanding.equals(new TextOperation().retain(12).insert(" "))).toBe(true);

    applyClient(new TextOperation().retain(13).insert("S"));
    expect(client.state instanceof Client.AwaitingWithBuffer).toBe(true);
    applyClient(new TextOperation().retain(14).insert("i"));
    applyClient(new TextOperation().retain(15).insert("t"));
    expect(!sentOperation).toBe(true);
    expect(doc).toBe("lorem  Dolor Sit");
    expect(client.state.outstanding.equals(new TextOperation().retain(12).insert(" "))).toBe(true);
    expect(client.state.buffer.equals(new TextOperation().retain(13).insert("Sit"))).toBe(true);

    client.applyServer(new TextOperation().retain(6).insert("Ipsum").retain(6));
    expect(doc).toBe("lorem Ipsum Dolor Sit");
    expect(client.state instanceof Client.AwaitingWithBuffer).toBe(true);
    expect(client.state.outstanding.equals(new TextOperation().retain(17).insert(" "))).toBe(true);
    expect(client.state.buffer.equals(new TextOperation().retain(18).insert("Sit"))).toBe(true);

    client.serverAck();
    expect(getSentOperation().equals(new TextOperation().retain(18).insert("Sit"))).toBe(true);
    expect(client.state instanceof Client.AwaitingConfirm).toBe(true);
    expect(client.state.outstanding.equals(new TextOperation().retain(18).insert("Sit"))).toBe(true);

    client.serverAck();
    expect(client.state instanceof Client.Synchronized).toBe(true);
    expect(doc).toBe("lorem Ipsum Dolor Sit");

    // Test AwaitingConfirm and AwaitingWithBuffer retry operation.
    applyClient(new TextOperation().retain(21).insert("a"));
    expect(client.state instanceof Client.AwaitingConfirm).toBe(true);

    client.serverRetry();
    expect(sentOperation.equals(new TextOperation().retain(21).insert('a'))).toBe(true);
    client.serverAck();
    expect(client.state instanceof Client.Synchronized).toBe(true);
    expect(doc).toBe("lorem Ipsum Dolor Sita");

    applyClient(new TextOperation().retain(22).insert("m"));
    expect(client.state instanceof Client.AwaitingConfirm).toBe(true);
    applyClient(new TextOperation().retain(23).insert("a"));
    expect(client.state instanceof Client.AwaitingWithBuffer).toBe(true);
    client.serverRetry();
    expect(sentOperation.equals(new TextOperation().retain(22).insert('ma'))).toBe(true);
  });
});
