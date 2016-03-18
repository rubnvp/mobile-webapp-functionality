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

.factory('Login', function($location, $q, Navbar, CompactScadaAPI){
    var logged = false;
    var username = undefined;
    
    function isLogged() {
        return logged;
    }
    
    function getUsername() {
        return username;
    }
    
    // ----- Login
    function login(username){
        return $q.reject("User already exists");
    }    
    function setLogin(_username) {
        logged = true;
        username = _username;
        Navbar.logged(true, username);
        console.log("User "+username+" is logged in");
    }
    
    // ----- Logout
    function logout(){
        // console.log("logout");
        // Navbar.logged(false, undefined);
    }    
    function setLogout() {
        console.log("User "+username+" is logged out");
        logged = false;
        username = undefined;
        Navbar.logged(false, undefined);
    }
    
    var Service = {
        isLogged: isLogged,
        getUsername: getUsername,
        login: login,
        logout: logout
    };     
    return Service;
})

.factory('CompactScadaAPI', function($http, lit){
    var baseSignal = "WTG";
    
    function getSignal(username, signal) {
        var finalSignal = baseSignal+'.'+username+'.'+signal;
        var jsonPost = finalSignal;
        return $http.post(lit.baseUrl+'/itemsFromPattern', jsonPost).then(function(result){
            return result.data[0].Value;
        });
    }
    
    function setSignal(username, signal, value){
        var finalSignal = baseSignal+'.'+username+'.'+signal;
        var jsonPost = [{
            Name: finalSignal,
            Value: value
        }];
        return $http.post(lit.baseUrl+'/item', jsonPost).then(function(result){
            console.log("Set "+finalSignal+" to "+value);
        });
    }
    
    var Service = {
        getSignal: getSignal,
        setSignal: setSignal
    };     
    return Service;
})

.factory('CompactScada', function($http, $q, Login, CompactScadaAPI){
    function getStatus() {
        if ( Login.isLogged() ) {
            return CompactScadaAPI.getSignal(Login.getUsername(), 'Status');
        }
        else {
            return $q.defer().reject("User not logged").promise;
        }        
    }        
    
    function setWindSpeed(windSpeed){
        if ( Login.isLogged() ) {
            return CompactScadaAPI.setSignal(Login.getUsername(), 'WindSpeed', windSpeed);
        }
        else {
            return $q.defer().reject("User not logged").promise;
        }      
    }
    
    var Service = {
        getStatus: getStatus,
        setWindSpeed: setWindSpeed
    };     
    return Service;
});

})();