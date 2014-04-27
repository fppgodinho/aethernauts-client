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
                console.log('Server connection closed');
            };
            
            $scope.login            = function (username, password)             {
                
            };
            
            $scope.$watch(function(){ return server.connected; }, function(nv, ov){
                if (nv === ov) return;
                $scope.serverConnected  = nv;
                
            });
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
    var ws              = null;
    var server          = {};
    server.connected    = false;
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
            console.log(JSON.parse(message.data));
        };
        
        return defer;
    };
    
    server.disconnect   = function ()                                           {
        if (!server.connected) return;
        ws.close();
    };
    
    return server;
}]);

