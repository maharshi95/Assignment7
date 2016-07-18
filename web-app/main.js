/**
 * Created by maharshigor on 18/07/16.
 */

function getProducts($scope,$http) {
    $http.get('localhost:8080/api/products').success(function (data) {
       $scope.products = data
    });
}

var myApp = angular.module("myApp", []);

myApp.controller('productController', function($scope,$http) {
    $http.get('/api/products').success(function (data) {
        $scope.products = data
    });
});

myApp.controller("HelloController",function ($scope) {
    $scope.helloTo = {}
    $scope.helloTo.title = "AngularJS"
});