'use strict';
(function(){ 

angular.module('app', [
  'ngRoute',
  'app.controllers'
])

.constant("lit", {
    baseUrl: "http://cscadademonight.westeurope.cloudapp.azure.com:8080/api",
    interval: 3000
})

.config(['$routeProvider', function($routeProvider) {
  $routeProvider

  .when('/login', {
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .when('/windmill', {
    templateUrl: 'templates/windmill.html',
    controller: 'windmillCtrl'
  })

  .otherwise({redirectTo: '/login'});
  
}]);

})();
