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
    var url = "http://cscadademonight.westeurope.cloudapp.azure.com:8081/compactscada/read/patterns/"+signal;
    
    function getStatus() {        
        return $http.get(url).then(function(result){
            return result.data[0].Value;
        });
    }
    
    var Service = {
        getStatus: getStatus
    };     
    return Service;
});

})();