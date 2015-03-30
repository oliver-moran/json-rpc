JSON-RPC
========

A simple JavaScript library to create, parse and manage JSON-RPC 2.0 calls. This library may be particularly useful to use the JSON-RPC specification inconjunction with something like [Socket.io](http://socket.io/).

For the JSON-RPC 2.0 specification, see: http://www.jsonrpc.org/specification

Pseudo code example for a JSON-RPC request:

    // Client:
    var request = new JSON_RPC.Request(method, params);
    var id = request.id;
    request.toString(); // send to server

    // Server:
    var request = JSON_RPC.parse(request);
    request.response = request.method(); // if successful
    request.toString(); // return to client

    // Back on Client:
    var request = JSON_RPC.parse(request);
    if (request.id == id) { // the request ID is maintained
        var response = request.response; // if successful
    }

Notifications are handled similarly but without support for IDs or a response/error:

    // Client:
    var request = new JSON_RPC.Notification(method, params);
    request.toString(); // send to server

    // Server:
    var request = JSON_RPC.parse(request);
    if (request.constructor === JSON_RPC.Notification) {
        // DO NOT reply to a Notification
        request.method();
    }
    
Error handling for requests (not notifications) are handled like this:

    // Server:
    var request = JSON_RPC.parse(request);
    if (request.error) request.toString(); // parse error, return to client
    
    var response = request.method();
    if (!reponse) { // hypothetical error scenario
        request.error = new JSON_RPC.Error(-1, "An error occurred");
    } else {
        request.response = response;
    }
    
    request.toString(); // return to client
    
The JSON_RPC object also contains pre-rolled errors:

    JSON_RPC.PARSE_ERROR
    JSON_RPC.INVALID_REQUEST
    JSON_RPC.METHOD_NOT_FOUND
    JSON_RPC.INVALID_PARAMS
    JSON_RPC.INTERNAL_ERROR
