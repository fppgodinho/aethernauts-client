aethernaut.directive('gameUi', [function()                                     {
    return {
        scope:      {
            
        },
        transcode:      true,
        replace:        true,
        templateUrl:    'html/templates/gameUI.html',
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
                    console.log('Logedin?', $scope.profile);
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
