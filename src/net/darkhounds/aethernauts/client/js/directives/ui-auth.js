aethernauts.directive('uiAuth', [function()                                      {
    return {
        scope:      {
            
        },
        transcode:      true,
        replace:        true,
        templateUrl:    'html/templates/ui-auth.html',
        controller:     ['$scope', 'server', 'session', function($scope, server, session) {
            $scope.profile          = null;
            
            $scope.username         = 'admin';
            $scope.password         = 'teste';
            $scope.nameFirst        = '';
            $scope.nameLast         = '';
            $scope.email            = '';
            
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
                    } else if (message.error)                                   {
                        alert(message.error);
                    }
                    session.setProfile($scope.profile);
                });
            };
            
            $scope.$watch(function(){ return session.getProfile(); }, function(nv, ov){
                if (nv === ov) return;
                $scope.profile          = nv;
                console.log('Profile:', $scope.profile);
            });
            
            function getDefault(list)                                           {
                if (list && list.length) for (var i in list) if (list[i].default) return list[i];
                return null;
            }
            
        }]
    };
}]);
