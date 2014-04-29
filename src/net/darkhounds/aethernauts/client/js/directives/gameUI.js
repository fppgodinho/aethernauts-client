/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var aethernauts = angular.module('aethernauts.darkhounds.net', []);

aethernauts.directive('gameUi', [function()                                     {
    return {
        scope:      {
            
        },
        transcode:      true,
        replace:        true,
        templateUrl:    'html/views/gameUI.html',
        controller:     ['$scope', 'server', function($scope, server)           {
            $scope.serverAddress    = '';
            $scope.serverPort       = 81;
            $scope.serverConnected  = server.connected;
            $scope.serverName       = '';
            
            $scope.profile          = null;
            
            $scope.username         = 'admin';
            $scope.password         = 'teste';
            $scope.nameFirst        = '';
            $scope.nameLast         = '';
            $scope.email            = '';
            
            
            $scope.connect          = function ()                               {
                server.connect($scope.serverAddress, $scope.serverPort,
                function()                                                      {
                    console.log('Server connection opened');
                },
                function()                                                      {
                    console.log('Server connection closed');
                });
            };
            
            $scope.disconnect       = function ()                               {
                server.disconnect();
            };
            
            $scope.login            = function ()                               {
                $scope.profile      = null;
                
                server.login($scope.username, $scope.password, function(message){
                    if (!message.error && message.result)                       {
                        $scope.profile          = message.result;
                        var defaultEmail        = getDefault($scope.profile.identity.emails);
                        $scope.password         = '';
                        $scope.username         = $scope.profile.credentials.username;
                        $scope.nameFirst        = $scope.profile.identity.name.first;
                        $scope.nameLast         = $scope.profile.identity.name.last;
                        $scope.email            = defaultEmail?defaultEmail.address:'';
                    }
                    console.log('Logedin?', message);
                });
            };
            
            $scope.$watch(function(){ return server.connected; }, function(nv, ov){
                if (nv === ov) return;
                $scope.serverConnected  = nv;
                $scope.profile          = $scope.serverConnected?$scope.profile:null;
            });
            
            $scope.$watch(function(){ return server.name; }, function(nv, ov)   {
                if (nv === ov) return;
                $scope.serverName       = server.name;
            });
            
            function getDefault(list)                                           {
                if (list && list.length) for (var i in list) if (list[i].default) return list[i];
                return null;
            }
            
        }]
    };
}]);

aethernauts.directive('gameViewport', [function()                               {
    return {
        scope:      {
            
        },
        transcode:      true,
        replace:        true,
        templateUrl:    'html/views/gameViewport.html',
        controller:     ['$scope', function($scope)                             {
            
        }]
    };
}]);

aethernauts.service('server', ['$q', '$rootScope', function($q, $rootScope)     {
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

