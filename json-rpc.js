/*
    The MIT License (MIT)

    Copyright (c) 2014 Oliver Moran

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
    of the Software, and to permit persons to whom the Software is furnished to do
    so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

var JSON_RPC = {};

(function () {
    "use strict";
    
    var id = 0, callbacks = {};
    
    /**
     * Constructs a new JSON-RPC Request
     * @param method A String containing the name of the method to be invoked. 
     * @param params (optional) A Structured value that holds the parameter values to be used during the invocation of the method.
     */
    JSON_RPC.Request = function (method, params) {
        this.jsonrpc = "2.0";
        this.method = method;
        if (typeof params !== "undefined") {
            this.params = params;
        }

        this.id = id++;
    };
    
    // Implements getters and setters for the result of a JSON-RPC Request.
    // The result may be an any Object or primitive
    Object.defineProperty(JSON_RPC.Request.prototype, "result", {
        get: function () { return this._result; },
        set: function (result) {
            delete this.method; // remove the method name
            delete this.params; // remove the params
            delete this.error; // remove error state if it exists
            this._result = result;
        }
    });

    // Implements getters and setters for the error state of a JSON-RPC Request.
    // Error should be a JSON_RPC.Error object
    Object.defineProperty(JSON_RPC.Request.prototype, "error", {
        get: function () { return this._error; },
        set: function (error) {
            delete this.method; // remove the method name
            delete this.params; // remove the params
            delete this.result; // remove result state if it exists
            this._error = error;
        }
    });

    /**
     * Returns a String representation of a JSON-RPC Request
     * @returns A JSON String
     */
    JSON_RPC.Request.prototype.toString = function () {
        var rpc = {
            jsonrpc: this.jsonrpc,
            id: this.id
        };

        if (this.method !== undefined) rpc.method = this.method;
        if (this.params !== undefined) rpc.params = this.params;
        if (this.result !== undefined) rpc.result = this.result;
        if (this.error !== undefined) rpc.error = this.error;
        
        return JSON.stringify(rpc);
    };
    
    /**
     * Constructs a new JSON-RPC Notification
     * @param method A String containing the name of the method to be invoked. 
     * @param params (optional) A Structured value that holds the parameter values to be used during the invocation of the method.
     */
    JSON_RPC.Notification = function (method, params) {
        this.jsonrpc = "2.0";
        this.method = method;
        if (typeof params !== "undefined") {
            this.params = params;
        }
    };
    
    /**
     * Returns a String representation of a JSON-RPC Notification
     * @returns A JSON String
     */
    JSON_RPC.Notification.prototype.toString = function () {
        var rpc = {
            jsonrpc: this.jsonrpc,
            method: this.method,
            params: this.params
        };
        
        return JSON.stringify(rpc);
    };
    
    /**
     * Constructs a new JSON-RPC Errror object
     * @params code A Number that indicates the error type that occurred. -32768 to -32000 are reserved.
     * @param message (optional) A String providing a short description of the error.
     * @param data (optional) A Primitive or Structured value that contains additional information about the error.
     */
    JSON_RPC.Error = function (code, message, data) {
        this.code = code;
        if (typeof message == "string") this.message = message;
        if (data !== undefined) this.data = data;
    };
    
    // stock errors
    JSON_RPC.PARSE_ERROR = new JSON_RPC.Error(-32700, "An error occurred on the server while parsing the JSON text.");
    JSON_RPC.INVALID_REQUEST = new JSON_RPC.Error(-32600, "The JSON sent is not a valid Request object.");
    JSON_RPC.METHOD_NOT_FOUND = new JSON_RPC.Error(-32601, "The method does not exist / is not available.");
    JSON_RPC.INVALID_PARAMS = new JSON_RPC.Error(-32602, "Invalid method parameter(s).");
    JSON_RPC.INTERNAL_ERROR = new JSON_RPC.Error(-32603, "Internal JSON-RPC error.");
    
    /**
     * Parses a JSON-RPC string and converts to a JSON-RPC object or an Array of such strings.
     * @params rpc A String or Array to parse to a JSON-RPC object.
     */
    JSON_RPC.parse = function (rpc) {
        // batch?
        if (rpc.constructor === Array) {
            var arr = [];
            rpc.forEach(function (el) {
                arr.push(JSON_RPC.parse(el));
            });
            return arr;
        }
        
        // parsable?
        var rpc;
        try {
            rpc = JSON.parse(rpc);
        } catch (err) {
            var obj = new JSON_RPC.Request();
            obj.result = JSON_RPC.PARSE_ERROR;
            obj.id = null;
            return obj;
        }
        
        // 2.0?
        if (rpc.jsonrpc !== "2.0") {
            var obj = new JSON_RPC.Request();
            obj.result = JSON_RPC.INVALID_REQUEST;
            obj.id = null;
            return obj;
        }
        
        // request or notification?
        var obj = (rpc.id === undefined)
                ? new JSON_RPC.Notification(rpc.method, rpc.params)
                : new JSON_RPC.Request(rpc.method, rpc.params);
        // have an ID?
        if (rpc.id !== undefined) obj.id = rpc.id;
        // is it a result?
        if (rpc.result !== undefined) obj.result = rpc.result;
        // is it a error?
        if (rpc.error !== undefined) {
            obj.error = new JSON_RPC.Error(
                rpc.error.code,
                rpc.error.message,
                rpc.error.data
            );
        }
        
        // parsed :-)
        return obj;
    };
        
})();

try {
    module.exports = JSON_RPC;
} catch (err) {
    // meh, probably not node
}
