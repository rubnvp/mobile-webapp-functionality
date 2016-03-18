'use strict';
(function(){ 

angular.module('app.controllers', ['app.services'])

.controller('navbarCtrl', function($scope, Navbar, Login) {
    $scope.view = null; 
    Navbar.view = function(view) {
        $scope.view = view;
    };
    
    $scope.logged = false;
    $scope.username = undefined; 
    Navbar.logged = function(logged, username) {
        $scope.logged = logged;
        $scope.username = username;
    }        
    
    $scope.navbarTitle = undefined;
    function setNavbarTitle(){
        switch ($scope.view){
            case 'login': 
                $scope.navbarTitle = "Welcome!";
            break;
            case 'windmill':
                $scope.navbarTitle = !$scope.logged ? "Not logged" : $scope.username;
            break;
            default: 
        }
    }
    $scope.$watch(setNavbarTitle);
    
    $scope.logout = function() {
        Login.logout();
    }
})

.controller('loginCtrl', function($scope, Navbar, Login) {
    Navbar.view('login');
    
    $scope.login = function() {
        Login.login($scope.username);
    }    
})

.controller('windmillCtrl', function($scope, $interval, lit, Navbar, CompactSCADA) {
    Navbar.view('windmill');
    // signals
    $scope.windSpeed = 0;    
    $scope.addWindSpeed = function(add){
        var windSpeed = $scope.windSpeed;
        if ($scope.status) {
            if( add > 0) {
                $scope.windSpeed =  windSpeed+add > lit.maxWindSpeed ? lit.maxWindSpeed : windSpeed + add;
            }
            else {
                $scope.windSpeed =  windSpeed+add < 0 ? 0 : windSpeed + add;
            }
        }
    };
    
    $scope.activePower = 0;
    function calculateActivePower(){
        var windSpeed = $scope.windSpeed;
        var activePower = windSpeed <= 0 ? 0 : Math.log(windSpeed)*500;  
        $scope.activePower = activePower.toFixed(2);
    }
    $scope.$watch(calculateActivePower);
    
    $scope.status = false;
    
    // windSpeed decreaser
    function decreaseWindSpeed(){
        var windSpeed = $scope.windSpeed;
        if (windSpeed > 0) {
            $scope.windSpeed = windSpeed < lit.decreaseValue ? 0 : windSpeed - lit.decreaseValue;
        }
    }
    //$interval(decreaseWindSpeed, lit.decreaseInterval);
    
    // updater
    function update(){
        CompactSCADA.getStatus().then(function(status){
            $scope.status = status;
            if (!status) $scope.windSpeed = 0;
        });
        CompactSCADA.setWindSpeed($scope.windSpeed);
    }
    $interval(update, lit.updateInterval);
    update();
});

})();