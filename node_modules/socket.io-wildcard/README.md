socket.io-wildcard [![build status](https://secure.travis-ci.org/lmjabreu/socket.io-wildcard.png)](http://travis-ci.org/lmjabreu/socket.io-wildcard)
==================

Extends socket.io with a wildcard event.

Examples
=====

```js
var socketio = require( 'socket.io' ),
    socketioWildcard = require( 'socket.io-wildcard' ),
    io = socketioWildcard( socketio ).listen( 8000 );

io.sockets.on( 'connection', function onConnection ( socket ) {
  socket.on( '*', function onWildcard ( event ) {
    // > { name: 'cake', args: [ { 'is a lie': true }, 'another argument' ] }
    console.log( event );
  } );

  socket.emit( 'cake', { 'is a lie': true }, 'another argument' );
} );
```
