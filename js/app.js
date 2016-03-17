'use strict';
(function(){ 

angular.module('app', [
  'ngRoute',
  'app.controllers'
])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider

  .when('/view1', {
    templateUrl: 'templates/view1.html',
    controller: 'view1Ctrl'
  })

  .when('/view2', {
    templateUrl: 'templates/view2.html',
    controller: 'view2Ctrl'
  })

  .otherwise({redirectTo: '/view1'});
  
}]);

})();
