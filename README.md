JSON-RPC
========

A simple JavaScript library to create, parse and manage JSON-RPC 2.0 calls. This library may be particularly useful to use the JSON-RPC specification inconjunction with something like [Socket.io](http://socket.io/).

For the JSON-RPC 2.0 specification, see: http://www.jsonrpc.org/specification

Pseudo code example for a JSON-RPC request:

    // Client:
    var request = JSONRPC.Request(method, params);
    var id = request.id;
    request.toString(); // send to server

    // Server:
    var request = JSONRPC.parse(request);
    request.response = request.method(); // if successful
    request.toString(); // return to client

    // Back on Client:
    var request = JSONRPC.parse(request);
    if (request.id == id) { // the request ID is maintained
        var response = request.response; // if successful
    }

Notifications are handled similarly but without support for IDs or a response/error:

    // Client:
    var request = JSONRPC.Notification(method, params);
    request.toString(); // send to server

    // Server:
    var request = JSONRPC.parse(request);
    if (request.constructor === JSONRPC.Notification) {
        // DO NOT reply to a Notification
        request.method();
    }
    
Error handling for requests (not notifications) are handled like this:

    // Server:
    var request = JSONRPC.parse(request);
    if (request.error) request.toString(); // parse error, return to client
    
    var response = request.method();
    if (!reponse) { // hypothetical error scenario
        request.error = new JSONRPC.Error(-1, "An error occurred");
    } else {
        request.response = response;
    }
    
    request.toString(); // return to client
    
The JSONRPC object also contains pre-rolled errors:

    JSONRPC.PARSE_ERROR
    JSONRPC.INVALID_REQUEST
    JSONRPC.METHOD_NOT_FOUND
    JSONRPC.INVALID_PARAMS
    JSONRPC.INTERNAL_ERROR