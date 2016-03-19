// TODO: refactor between Login <-> LoginProtocol, CompactScada <-> CompactScadaAPI

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

.factory('Login', function($q, $window, LoginProtocol, Navbar, CompactScadaAPI, Intervals, Random){
    var logged = false;
    var username = $window.localStorage.getItem("username"); // null at first time
    var initialWindSpeed = undefined; // fill if reconnect succeed
    
    function isLogged() {
        return logged;
    }
    
    function getUsername() {
        return username;
    }
    
    function getInitialWindSpeed() {
        return initialWindSpeed;
    }
    
    // ----- Login
    function login(username) {
        //return $q.reject("User already exists");
        username = username + Random.randomInt(1, 200);
        return LoginProtocol.checkUserExists(username)
        .then(function(user){
            if (user.exists) return $q.reject("User already exists."); // collision
            var signals = [
                {
                    Name: "WTG."+username+".WindSpeed",
                    Type: "DOUBLE",
                    InitialQuality : 0xC0,
                    InitialValue: 0
                },  
                {
                    Name: "WTG."+username+".Status",
                    Type: "BOOL",
                    InitialQuality : 0xC0,
                    InitialValue: true
                },
            ];
            return CompactScadaAPI.createSignals(signals);
        })
        .then(function(result){
           if (result.data.WrittenItems !== 2) return $q.reject("An error has occurred, please try again.");
           setLogin(username);
           return $q.when(username);
        });
    }
    
    function reconnect(_username, windSpeed){
        setLogin(_username);
        initialWindSpeed = windSpeed;
    }
        
    function setLogin(_username) {
        logged = true;
        username = _username;
        $window.localStorage.setItem("username", username);
        Navbar.logged(true, username);
    }
    
    // ----- Logout
    function logout() {
        var signals = ["WTG."+username+".WindSpeed", "WTG."+username+".Status"];
        return CompactScadaAPI.deleteSignals(signals)
        .then(function(){
            var _username = username;
            setLogout();
            return $q.when(_username);
        });
    }
    
    function setLogout() {       
        logged = false;
        username = undefined;
        initialWindSpeed = undefined;
        $window.localStorage.removeItem("username");
        Intervals.clearAll();
        Navbar.logged(false, undefined);
    }
    
    var Service = {
        isLogged: isLogged,
        getUsername: getUsername,
        getInitialWindSpeed: getInitialWindSpeed,
        login: login,
        reconnect: reconnect,
        logout: logout
    };     
    return Service;
})

.factory('LoginProtocol', function ($q, CompactScadaAPI){
    function checkUserExists(username){
        var deferred = $q.defer();
      
        CompactScadaAPI.getSignal(username, "WindSpeed")
        .then(function(value){
            if (value === undefined) {
                deferred.resolve({
                    exists: false,
                    name: username,
                    windSpeed: undefined
                });
            }
            else {
                deferred.resolve({
                    exists: true,
                    name: username,
                    windSpeed: value
                });
            }
        });
        
        return deferred.promise; 
    }
    
    var Service = {
        checkUserExists: checkUserExists
    };     
    return Service;
})

.factory('CompactScadaAPI', function($http, lit){
    var baseSignal = "WTG";
    
    function getSignal(username, signal) {
        var jsonPost = baseSignal+'.'+username+'.'+signal;
        return $http.post(lit.baseUrl+'/itemsFromPattern', jsonPost).then(function(result){
            var value = ( result.data && result.data[0] && result.data[0].Value !== undefined ) ? result.data[0].Value : undefined;
            return value;
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
    
    function createSignals(signals){
        return $http.post(lit.baseUrl+'/item/create', signals);
    }
    
    function deleteSignals(signals){
        var config = { data: signals };
        return $http.delete(lit.baseUrl+'/item/delete', config);
    }        
    
    var Service = {
        getSignal: getSignal,
        setSignal: setSignal,
        createSignals: createSignals,
        deleteSignals: deleteSignals
    };     
    return Service;
})

.factory('CompactScada', function($q, Login, CompactScadaAPI){
    function getStatus() {
        if ( Login.isLogged() ) {
            return CompactScadaAPI.getSignal(Login.getUsername(), 'Status');
        }
        else {
            return $q.reject("User not logged.");
        }        
    }        
    
    function setWindSpeed(windSpeed){
        if ( Login.isLogged() ) {
            return CompactScadaAPI.setSignal(Login.getUsername(), 'WindSpeed', windSpeed);
        }
        else {
            return $q.reject("User not logged.");
        }
    }
    
    var Service = {
        getStatus: getStatus,
        setWindSpeed: setWindSpeed
    };     
    return Service;
})

.factory('Intervals', function($interval){
    var updateSignals = null;
    var decreaseWindSpeed = null;
    var intervals = [];
    
    function setInterval(interval){
        intervals.push(interval);
    }
    
    function clearAll(){
        intervals.forEach(function(interval){
            $interval.cancel(interval);
        });
        intervals = [];
    }
    
    var Service = {
        setInterval: setInterval,
        clearAll: clearAll
    };
    return Service;
})

.factory('Random', function(){
    function randomInt(min,max) {
        return Math.floor(Math.random()*(max-min+1)+min);
    }
    
    var Service = {
        randomInt: randomInt
    };     
    return Service;
});

})();