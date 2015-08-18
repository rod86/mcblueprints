'use strict';


// Declare app level module which depends on filters, and services
angular.module('Blueprints', [
  'ngRoute',
  'Blueprints.filters',
  'Blueprints.services',
  'Blueprints.directives',
  'Blueprints.controllers',
  'ngCookies',
  'ui.bootstrap',
  'ngFileUpload'
])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider.when('/blueprint/view/:id', {
            templateUrl: 'partials/blueprint-detail.html',
            controller: 'BlueprintDetailCtrl'
        });
        $routeProvider.when('/blueprint/add', {
            templateUrl: 'partials/blueprint-form.html',
            controller: 'BlueprintAddCtrl',
            title: 'Add Blueprint',
            data: {
                requireLogin: true
            }
        });
        $routeProvider.when('/signup', {
            templateUrl: 'partials/signup.html',
            controller: 'SignupCtrl',
            title: 'Sign Up'
        });
        $routeProvider.when('/signup/success', {
            templateUrl: 'partials/signup-ok.html',
            title: 'Sign Up'
        });
        $routeProvider.when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl',
            title: 'Login'
        });
        $routeProvider.when('/my-blueprints', {
            templateUrl: 'partials/my-blueprints.html',
            controller: 'MyBlueprintsCtrl',
            title: 'My Blueprints',
            data: {
                requireLogin: true
            }
        });
        $routeProvider.when('/my-blueprints/edit/:id', {
            templateUrl: 'partials/blueprint-form.html',
            controller: 'BlueprintEditCtrl',
            title: 'My Blueprints',
            data: {
                requireLogin: true
            }
        });
        $routeProvider.when('/profile', {
            templateUrl: 'partials/profile.html',
            title: 'Edit Profile',
            data: {
                requireLogin: true
            }
        });
        $routeProvider.when('/', {
            templateUrl: 'partials/index.html',
            controller: 'IndexCtrl'
        });
        $routeProvider.otherwise({redirectTo: '/'});

        $locationProvider.html5Mode(true);
    }])
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    })
    .run(['$rootScope', '$location', '$window', function($rootScope, $location, $window){
        if ($window.sessionStorage.getItem('user')) {
            $rootScope.user = angular.fromJson($window.sessionStorage.getItem('user'));
        }
        $rootScope.$on('$routeChangeStart', function(event, next){
            if (next.data !== undefined) {
                if (next.data.requireLogin && !$rootScope.user) {
                    $location.path('/login');
                }
            }
        });
    }])
    .constant('APP_NAME', 'MC Blueprints');
