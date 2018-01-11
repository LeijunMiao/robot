module.exports = function ( socketio ) {
  // Add support for wilcard event
  socketio.Manager.prototype.onClientMessage = function onClientMessage ( id, packet ) {
    if ( this.namespaces[ packet.endpoint ] ) {
      this.namespaces[ packet.endpoint ].handlePacket( id, packet );
      // BEGIN: Wildcard patch
      packet2 = JSON.parse( JSON.stringify( packet ) );
      packet2.name = '*';
      packet2.args = { name: packet.name, args: packet2.args };

      this.namespaces[ packet.endpoint ].handlePacket( id, packet2 );
      // END: Wildcard patch
    }
  };

  return socketio;
};
