var vows = require( 'vows' ),
    assert = require( 'assert' ),
    io = require( 'socket.io' ),
    ioWildcard = require( '../index' ),
    ioClient = require( 'socket.io-client' ),
    PORT = 7463;

// creates a socket.io client for the given server
var client = function client ( server, namespace, options ) {
  if ( 'object' == typeof namespace ) {
    options = namespace;
    namespace = null;
  }
  return ioClient.connect( 'ws://0.0.0.0:' + PORT, options );
};

vows.describe( 'socket.io-wildcard' ).addBatch( {
  'when an event is emitted': {
    topic: function setupTopic () {
      var self = this;
      // Setup server
      var ioServer = ioWildcard( io ).listen( PORT );
      // Bind wildcard event listener on server, emit to client as callback
      ioServer.sockets.on( 'connection', function ( socket ) {
        socket.on( '*', function onWildcardHandler ( event ) {
          self.callback( event.name, event.args );
        } );
      } );
      // Connect client
      ioClientSocket = client( ioServer );
      // Emit event from client
      ioClientSocket.emit( 'beep', 'boop' );
    },
    'wildcard should catch it': function testWildcard ( eventName, eventArgs ) {
      // Check if handler contains the message broadcasted above
      assert.equal( eventName, 'beep' );
      assert.equal( eventArgs[ 0 ], 'boop' );
    }
  }
} )[ 'export' ]( module );