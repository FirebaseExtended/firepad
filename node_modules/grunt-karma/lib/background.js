var Server = require('karma').Server

process.on('message', function (data) {
  var server = new Server(data.config)
  server.start()
})
