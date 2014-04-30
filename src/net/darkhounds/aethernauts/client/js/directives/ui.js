aethernauts.directive('ui', [function()                                          {
    return {
        scope:      {
            
        },
        transcode:      true,
        replace:        true,
        templateUrl:    'html/templates/ui.html',
        controller:     ['$scope', 'server', 'session', function($scope, server, session) {
            $scope.connected        = false;
            
            $scope.$watch(function(){ return server.isConnected(); }, function(nv, ov){
                if (nv === ov) return;
                $scope.connected    = nv;
            });
        }]
    };
}]);
