'use strict';
(function(){ 

angular.module('app.services', [])

.factory('Navbar', function(){
    function view(view) {return null;}
    
    var Service = {
        view: view
    };     
    return Service;
})

.factory('CompactSCADA', function($http, $q, lit){
    var signal = "WTG.User1.Status";

    function getStatus() {
        // var req = {
        //     method: 'POST',
        //     url: lit.baseUrl,
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     data: signal
        // }
        // return $http(req).then(function(result){
        //     debugger;
        //     return result.data[0].Value;
        // });
        return $http.get("http://cscadademonight.westeurope.cloudapp.azure.com:8081/compactscada/read/patterns/"+signal)
        .then(function(result){
            return result.data[0].Value;
        });
    }
    
    function setWindSpeed(windSpeed){
        console.log('windSpeed = '+windSpeed);
    }
    
    var Service = {
        getStatus: getStatus,
        setWindSpeed: setWindSpeed
    };     
    return Service;
});

})();