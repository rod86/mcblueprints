'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('Blueprints.services', [])
    .factory('blueprintsFactory', ['$http', function($http){
        return {
            getUser: function(id) {
                return $http.get('/api/users/' + id);
            },
            addUser: function(user) {
                return $http.post('/api/users', user);
            },
            updateUser: function(id, user) {
                return $http.put('/api/users/' + id, user);
            },
            updateUserPassword: function(id, user) {
                return $http.put('/api/users/' + id + '/password', user);
            },
            deleteUser: function(id) {
                return $http.delete('/api/users/' + id);
            },
            getBlueprints: function(params) {
                var url = '/api/blueprints',
                    search = [];

                if (params != undefined) {
                    if (params.user != undefined && params.user != '') {
                        search.push('user='+params.user);
                    }

                    if (params.username != undefined && params.username != '') {
                        search.push('username='+params.username);
                    }
                }

                if (search.length) {
                    url += '?' + search.join('&');
                }

                return $http.get(url);
            },
            getBlueprint: function(id) {
                return $http.get('/api/blueprints/' + id);
            },
            addBlueprint: function(blueprint) {
                return $http.post('/api/blueprints', blueprint);
            },
            updateBlueprint: function(id, data) {
                return $http.put('/api/blueprints/'+id, data);
            },
            deleteBlueprint: function(id) {
                return $http.delete('/api/blueprints/'+id);
            }
        };
    }])
    .factory('AuthService', ['$http', '$rootScope', '$window', function($http, $rootScope, $window){
        return {
            login: function(user, success, error) {
                $http.post('/api/login', user)
                    .success(function(user){
                        $rootScope.user = user;
                        $window.sessionStorage.setItem('user', angular.toJson(user));
                        success(user);
                    }).error(error);
            },
            logout: function(success, error) {
                $http.get('/api/logout')
                    .success(function(user){
                        $rootScope.user = null;
                        $window.sessionStorage.removeItem('user');
                        success(user);
                    }).error(error);
            }
        };
    }])
    .factory('AuthInterceptor', ['$q' , '$location', function($q, $location) {
        return {
            response: function(response) {
                return response;
            },
            responseError: function(response) {
                if (response.status == 401) {
                    $location.path('/login');
                }
                return $q.reject(response);
            }
        };
    }]);
