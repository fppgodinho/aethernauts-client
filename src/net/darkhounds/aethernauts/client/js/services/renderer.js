aethernaut.service('server', ['$q', '$rootScope', function($q, $rootScope)      {
    var salt            = '';
    var token           = '';
    var ws              = null;
    var server          = {};
    server.connected    = false;
    server.name         = '';
    server.connect      = function (address, port, onConnect, onDisconnect)     {
        address         = address || 'localhost';
        port            = port || 80;
        
        var defer       = $q.defer();
        if (server.connected) server.disconnect();
        ws              = new WebSocket("ws://" + address + ':' + port);
        ws.onopen       = function()                                            {
            server.connected = true;
            if (onConnect) $rootScope.$apply(onConnect());
        };
        ws.onclose      = function()                                            {
            server.connected    = false;
            if (onDisconnect) $rootScope.$apply(onDisconnect());
        };

        ws.onmessage    = function(message)                                     {
            handleMessage(message.data);
        };
        
        return defer;
    };
    
    server.disconnect   = function ()                                           {
        if (!server.connected) return;
        ws.close();
    };
    
    server.login        = function (username, password, callback)               {
        if (!server.connected) return;
        password = CryptoJS.MD5(CryptoJS.MD5(password + '_' + salt).toString() + token).toString();
        ws.send(JSON.stringify({type:'login', username:username, password:password, callbackID:addCallback(callback)}));
    };
    
    function handleMessage(message)                                             {
        message     = JSON.parse(message);
        $rootScope.$apply(function()                                            {
            switch(message.type)                                                {
                case 'session':
                    if (message.state == 'start')                               {
                        token       = message.token;
                        salt        = message.salt;
                        server.name = message.name;
                    }
                    break;
                case 'response':
                    message.callbackID = +message.callbackID;
                    if (message.callbackID < callbacks.length && callbacks[message.callbackID]){
                        var callback    = callbacks[message.callbackID];
                        callbacks[message.callbackID]   = null;
                        callback(message);
                    }
                    break;
                default: break;
            }
        });
    }
    
    var callbacks = [];
    function addCallback(callback)                                              {
        callbacks.push(callback);
        return callbacks.length - 1;
    }
    
    return server;
}]);
