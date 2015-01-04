'use strict';

KylinApp.controller('CubeModelCtrl', function ($scope) {
    var DataModel = {
        init: function () {
            return {
                name: '',
                fact_table: '',
                lookups: []
            };
        }
    };

    // Adapter between new data model and legacy cube schema.
    $scope.prepareModel = function () {
        if (!$scope.cubeMetaFrame.hasOwnProperty('model')) {
            // Old version cube schema does not have model concept, try to build one based on legacy schema.
            if ($scope.cubeMetaFrame.fact_table) {
                // This is the case when editing cube.
                var model = DataModel.init();

                model.fact_table = $scope.cubeMetaFrame.fact_table;

                // Get join relationships for old dimensions which using join.
                var tables = [];

                angular.forEach($scope.cubeMetaFrame.dimensions, function (dim) {
                    // De-duplicate: adopt 1st one.
                    if (tables.indexOf(dim.table) == -1 && dim.join) {
                        tables.push(dim.table);
                        model.lookups.push({table: dim.table, join: dim.join});
                    }
                });

                $scope.cubeMetaFrame.model = model;
            } else {
                // This is the case when create new cube.
                $scope.cubeMetaFrame.model = DataModel.init();
            }

            // Currently set model name same as cube name, hidden from user.
            $scope.cubeMetaFrame.model.name = $scope.cubeMetaFrame.name;
        }
    };

    // TODO this is for legacy cube schema.
    $scope.prepareModel();

    var Lookup = {
        init: function () {
            return {
                table: '',
                join: {
                    type: '',
                    primary_key: [],
                    foreign_key: []
                }
            };
        }
    };

    // Initialize params.
    $scope.lookupState = {
        editing: false,
        editingIndex: -1,
        showPanel: false,
        filter: ''
    };

    $scope.newLookup = Lookup.init();

    var lookupList = $scope.cubeMetaFrame.model.lookups;

    $scope.addLookup = function () {
        // Push newLookup which bound user input data.
        lookupList.push(angular.copy($scope.newLookup));

        $scope.resetParams();
    };

    $scope.editLookup = function (lookup) {
        $scope.lookupState.editingIndex = lookupList.indexOf(lookup);
        $scope.lookupState.editing = true;

        // Make a copy of model will be editing.
        $scope.newLookup = angular.copy(lookup);

        $scope.lookupState.showPanel = true;
    };

    $scope.doneEditLookup = function () {
        // Copy edited model to destination model.
        angular.copy($scope.newLookup, lookupList[$scope.lookupState.editingIndex]);

        $scope.resetParams();
    };

    $scope.cancelLookup = function () {
        $scope.resetParams();
    };

    $scope.removeLookup = function (lookup) {
        lookupList.splice(lookupList.indexOf(lookup), 1);
    };

    $scope.resetParams = function () {
        $scope.lookupState.editing = false;
        $scope.lookupState.editingIndex = -1;
        $scope.lookupState.showPanel = false;

        $scope.newLookup = Lookup.init();
    };
});
