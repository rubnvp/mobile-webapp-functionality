'use strict';
(function(){ 

angular.module('app.controllers', ['app.services'])

.controller('navbarCtrl', function($scope, $location, Navbar, Login) {
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
        Login.logout().then(function(username){
            console.log("User "+username+" is logged out");
            $location.path("/login");
        }, function(error){
            console.error(error);
        });
    }
})

.controller('loginCtrl', function($scope, $location, Navbar, Login) {
    Navbar.view('login');    

    $scope.username =  undefined;
    
    $scope.login = function() {
        Login.login($scope.username)
        .then(function(username){
            console.log("User logged as "+username);
            $location.path("/windmill");
        }, function(error){
            console.error(error);
        });
    }
    
    $scope.enableLogin = false;
    function enableLogin(){
        var username = $scope.username ? $scope.username : '!invalid';
        var regexp = /^[(A-Z)|(a-z)|(0-9)]+$/g;        
        $scope.enableLogin = regexp.test(username);
    }
    $scope.$watch(enableLogin);
})

.controller('windmillCtrl', function($scope, $interval, lit, Navbar, Intervals, Login, CompactScada) {
    Navbar.view('windmill');
    // signals
    $scope.windSpeed = Login.getInitialWindSpeed() !== undefined ? Login.getInitialWindSpeed() : 0;    
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
    $interval.cancel(Intervals.decreaseWindSpeed);
    function decreaseWindSpeed(){
        var windSpeed = $scope.windSpeed;
        if (windSpeed > 0) {
            $scope.windSpeed = windSpeed < lit.decreaseValue ? 0 : windSpeed - lit.decreaseValue;
        }
    }
    //Intervals.decreaseWindSpeed = $interval(decreaseWindSpeed, lit.decreaseInterval);
    
    // updater
    $interval.cancel(Intervals.updateSignals);
    function updateSignals(){
        CompactScada.getStatus().then(function(status){
            $scope.status = status;
            if (!status) $scope.windSpeed = 0;
        }, function(error){
            console.error(error);
        });
        CompactScada.setWindSpeed($scope.windSpeed);
    }
    Intervals.updateSignals = $interval(updateSignals, lit.updateInterval);
    updateSignals();
});

})();