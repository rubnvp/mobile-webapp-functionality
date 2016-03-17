'use strict';
(function(){ 

angular.module('app', [
  'ngRoute',
  'app.controllers'
])

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
