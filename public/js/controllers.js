'use strict';

/* Controllers */

angular.module('Blueprints.controllers', [])
    .controller('AppCtrl', ['$scope', 'APP_NAME','$window', 'AuthService', '$location', function($scope, APP_NAME, $window, AuthService, $location){
        $scope.$on('$routeChangeSuccess', function (ev, current) {
            var title = APP_NAME;
            $scope.pagetitle = null;

            if (current.$$route.title != undefined) {
                title += ' - ' + current.$$route.title;
                $scope.pagetitle = current.$$route.title;
            }
            $window.document.title = title;
        });

        $scope.$on('contentLoaded', function(event, args) {
            $scope.pagetitle = args.pagetitle;
        });

        $scope.logout = function() {
            AuthService.logout(
                function(){
                    $location.path('/');
                },
                function(err) {
                    console.log(err);
                }
            )
        };

        $scope.cancel = function () {
            window.history.back();
        };
    }])
    .controller('IndexCtrl', ['$scope', 'blueprintsFactory', function($scope, blueprintsFactory) {
        $scope.blueprints = [];

        blueprintsFactory.getBlueprints().then(
            function (response) {
                $scope.blueprints = response.data.data;
            },
            function (err) {
                console.log(err);
            }
        );
    }])
    .controller('BlueprintDetailCtrl', ['$scope', '$routeParams', 'blueprintsFactory', function($scope, $routeParams, blueprintsFactory) {
        var id = $routeParams.id;
        $scope.blueprint = null;

        blueprintsFactory.getBlueprint(id).then(
            function (response) {
                $scope.$emit('contentLoaded', {pagetitle: response.data.blueprint.title});
                $scope.blueprint = response.data.blueprint;
            },
            function (err) {
                console.log(err);
            }
        );
    }])
    .controller('MyBlueprintsCtrl', ['$scope', '$rootScope', 'blueprintsFactory', '$modal', function($scope, $rootScope, blueprintsFactory, $modal){
        var id = $rootScope.user.id;

        $scope.blueprints = [];

        blueprintsFactory.getBlueprints({user: id}).then(
            function (response) {
                $scope.blueprints = response.data.data;
            },
            function (err) {
                console.log(err);
            }
        );

        $scope.remove = function (index) {
            var id = $scope.blueprints[index]._id;

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'modal.html'
            });

            modalInstance.result.then(function () {
                blueprintsFactory.deleteBlueprint(id).then(
                    function (response) {
                        if (response.data.status == 'ok') {
                            $scope.user = response.data.user;
                            $scope.blueprints.splice(index, 1);
                            $scope.alert = {type: 'success', message: 'Blueprint deleted'};
                        } else {
                            if (response.data.message)
                                $scope.alert = {type: 'danger', message: 'Error getting user data'};
                        }
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            });
        };
    }])
    .controller('BlueprintAddCtrl', ['$scope', 'blueprintsFactory', '$rootScope', '$location', function($scope, blueprintsFactory, $rootScope, $location) {
        $scope.isCreate = true;

        $scope.submitForm = function(form) {
            $scope.submitted = true;

            if (form.$valid) {
                $scope.alert = null;
                var data = $scope.blueprint;
                data.user = $rootScope.user.id;
                data.images = $scope.images;
                console.log($scope.images);

                blueprintsFactory.addBlueprint(data).then(
                    function (response) {
                        if (response.data.status == 'ok') {
                           $location.path('/my-blueprints/edit/' + response.data.id);
                        } else {
                            if (response.data.message)
                                $scope.alert = {type: 'danger', message: response.data.message};
                        }
                    },
                    function (error) {
                        $scope.alert = {type: 'danger', message: 'Server error'};
                    }
                );
            } else {
                $scope.alert = {type: 'danger', message: 'Form is invalid. Please, check errors.'};
            }
        };
    }])
    .controller('BlueprintEditCtrl', ['$scope', 'blueprintsFactory', '$routeParams', 'Upload', function($scope, blueprintsFactory, $routeParams, Upload) {
        var id = $routeParams.id;
        $scope.blueprint = null;
        $scope.isCreate = false;
        $scope.images = [];

        blueprintsFactory.getBlueprint(id).then(
            function (response) {
                $scope.blueprint = response.data.blueprint;
                $scope.images    = response.data.blueprint.images;
            },
            function (err) {
                console.log(err);
            }
        );

        $scope.submitForm = function(form) {
            $scope.submitted = true;

            if (form.$valid) {
                $scope.alert = null;
                var data = $scope.blueprint;

                blueprintsFactory.updateBlueprint(id, data).then(
                    function (response) {
                        if (response.data.status == 'ok') {
                            $scope.alert = {type: 'success', message: 'Blueprint updated'};
                        } else {
                            if (response.data.message)
                                $scope.alert = {type: 'danger', message: response.data.message};
                        }
                    },
                    function (error) {
                        $scope.alert = {type: 'danger', message: 'Server error'};
                    }
                );
            } else {
                $scope.alert = {type: 'danger', message: 'Form is invalid. Please, check errors.'};
            }
        };

        $scope.$watch('files', function () {
            $scope.upload($scope.files);
        });

        $scope.removeFile = function(file) {
            blueprintsFactory.deleteBlueprintImage(id, file._id).then(
                function (response) {
                    if (response.data.status == 'ok') {
                        var index = $scope.images.indexOf(file);
                        $scope.images.splice(index, 1);
                    } else {
                        if (response.data.message)
                            $scope.alert = {type: 'danger', message: response.data.message};
                    }
                },
                function (error) {
                    console.log(error);
                }
            );
        };

        $scope.upload = function (files) {
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    Upload.upload({
                        url: '/api/blueprints/'+id+'/add-image',
                        file: file
                    }).success(function (data, status, headers, config) {
                        $scope.images.push(data.file);
                    });
                }
            }
        };
    }])
    .controller('SignupCtrl', ['$scope', 'blueprintsFactory', '$location', function($scope, blueprintsFactory, $location) {
        $scope.submitForm = function(form) {
            $scope.submitted = true;

            if (form.$valid) {
                $scope.alert = null;
                var data = $scope.user;

                blueprintsFactory.addUser(data).then(
                    function (response) {
                        if (response.data.status == 'ok') {
                            $location.path('/signup/success');
                        } else {
                            if (response.data.message)
                                $scope.alert = {type: 'danger', message: response.data.message};
                        }
                    },
                    function (error) {
                        $scope.alert = {type: 'danger', message: 'Server error'};
                    }
                );
            } else {
                $scope.alert = {type: 'danger', message: 'Form is invalid. Please, check errors.'};
            }
        };
    }])
    .controller('LoginCtrl', ['$scope', 'AuthService','$log', '$location', function($scope, AuthService, $log, $location) {
        $scope.login = function(user) {
            AuthService.login(user,
                function(){
                    $scope.error = null;
                    $location.path('/');
                },
                function(error){
                    $scope.error = 'Invalid username and/or password';
                    $log.error(error);
                }
            );
        };
    }])
    .controller('ProfileEditCtrl', ['$scope', '$rootScope','blueprintsFactory', function($scope, $rootScope, blueprintsFactory){
        blueprintsFactory.getUser($rootScope.user.id).then(
            function (response) {
                if (response.data.status == 'ok') {
                    $scope.user = response.data.user;
                } else {
                    if (response.data.message)
                        $scope.alert = {type: 'danger', message: 'Error getting user data'};
                }
            },
            function (err) {
                console.log(err);
            }
        );

        $scope.submitForm = function(form) {
            $scope.submitted = true;

            if (form.$valid) {
                $scope.alert = null;
                var data = $scope.user;

                blueprintsFactory.updateUser(data._id, data).then(
                    function (response) {
                        if (response.data.status == 'ok') {
                            $scope.alert = {type: 'success', message: 'Updated successfully'};
                        } else {
                            if (response.data.message)
                                $scope.alert = {type: 'danger', message: response.data.message};
                        }
                    },
                    function (error) {
                        $scope.alert = {type: 'danger', message: 'Server error'};
                    }
                );
            } else {
                $scope.alert = {type: 'danger', message: 'Form is invalid. Please, check errors.'};
            }
        };
    }])
    .controller('ProfileChangePasswordCtrl', ['$scope', '$rootScope', 'blueprintsFactory', function($scope, $rootScope, blueprintsFactory){
        $scope.submitForm = function(form) {
            $scope.submitted = true;

            if (form.$valid) {
                $scope.alert = null;
                var id = $rootScope.user.id
                var data = $scope.user;

                blueprintsFactory.updateUserPassword(id, data).then(
                    function (response) {
                        if (response.data.status == 'ok') {
                            $scope.alert = {type: 'success', message: 'Updated successfully'};
                        } else {
                            if (response.data.message)
                                $scope.alert = {type: 'danger', message: response.data.message};
                        }
                    },
                    function (error) {
                        $scope.alert = {type: 'danger', message: 'Server error'};
                    }
                );
            } else {
                $scope.alert = {type: 'danger', message: 'Form is invalid. Please, check errors.'};
            }
        };
    }])
    .controller('ProfileDeleteCtrl', ['$scope', '$rootScope', 'blueprintsFactory', '$window', '$location', function($scope, $rootScope, blueprintsFactory, $window, $location){
        $scope.delete = function() {
            var id = $rootScope.user.id;
            blueprintsFactory.deleteUser(id).then(
                function (response) {
                    if (response.data.status == 'ok') {
                        $rootScope.user = null;
                        $window.sessionStorage.removeItem('user');
                        $location.path('/');
                    } else {
                        if (response.data.message)
                            $scope.alert = {type: 'danger', message: response.data.message};
                    }
                },
                function (error) {
                    $scope.alert = {type: 'danger', message: 'Server error'};
                }
            );
        };
    }]);