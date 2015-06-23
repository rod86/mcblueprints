'use strict';

/* Directives */


angular.module('Blueprints.directives', [])
    .directive('equal', function() {
        return {
            require: 'ngModel',
            scope: {
                equal: '='
            },
            link: function(scope, elem, attrs, ctrl) {
                ctrl.$validators.equal = function(modelValue, viewValue) {
                    if (modelValue=='' || modelValue==undefined) {
                        ctrl.$setValidity('match', true);
                        return false;
                    }

                    var isValid = modelValue === scope.equal;
                    ctrl.$setValidity('match', isValid);
                    return isValid ? modelValue : '';
                };

                scope.$watch('equal', function(newVal, oldVal) {
                    ctrl.$validate();
                });
            }
        };
    });




