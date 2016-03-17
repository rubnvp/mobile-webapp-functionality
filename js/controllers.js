'use strict';
(function(){ 

angular.module('app.controllers', ['app.services'])

.controller('navbarCtrl', function($scope, Navbar) {    
    Navbar.view = function(view) {
        $scope.view = view;
    }
})

.controller('loginCtrl', function($scope, Navbar) {
    Navbar.view('login'); 
  
})

.controller('windmillCtrl', function($scope, $interval, lit, Navbar, CompactSCADA) {
    Navbar.view('windmill');
    // signals
    $scope.windSpeed = 0;    
    $scope.addWindSpeed = function(add){
        if ($scope.status) $scope.windSpeed += add;
    };
    
    $scope.activePower = 0;
    function calculateActivePower(){
        var windSpeed = $scope.windSpeed;
        var activePower = windSpeed <= 0 ? 0 : Math.log(windSpeed)*500;  
        $scope.activePower = activePower.toFixed(2);
    }
    $scope.$watch(calculateActivePower);
    
    $scope.status = false;
    
    // updater
    function refresh(){
        CompactSCADA.getStatus().then(function(status){
            $scope.status = status;
            if (!status) $scope.windSpeed = 0;
        });
    }
    $interval(refresh, lit.interval);
    refresh();
});

})();