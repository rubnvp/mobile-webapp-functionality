'use strict';
(function(){ 

angular.module('app.services', [])

.factory('Navbar', function(){
    // will be overwrite by navbarCtrl
    var Service = {
        view: null,
        logged: null,
        loggedAs: null
    };     
    return Service;
})

.factory('Login', function(Navbar, CompactSCADA){
    function login(username){
        console.log("logged as "+username);
        Navbar.logged(true, username);
    }
    
    function logout(){
        console.log("logout");
        Navbar.logged(false, undefined);
    }
    
    var Service = {
        login: login,
        logout: logout
    };     
    return Service;
})

.factory('CompactSCADA', function($http, lit){
    var signal = "WTG.User1";

    function getStatus() {
        return $http.post(lit.baseUrl+'/itemsFromPattern', signal+'.Status').then(function(result){
            return result.data[0].Value;
        });
    }
    
    function setWindSpeed(windSpeed){
        var itemToSend = [{
            Name: signal+'.WindSpeed',
            Value: windSpeed
        }];
        return $http.post(lit.baseUrl+'/item', itemToSend).then(function(result){
            console.log("Set "+signal+'.WindSpeed'+" to "+windSpeed);
        });
    }
    
    var Service = {
        getStatus: getStatus,
        setWindSpeed: setWindSpeed
    };     
    return Service;
});

})();