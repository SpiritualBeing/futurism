angular.module('futurism')
	.controller('GameSummaryCtrl', function($scope, $routeParams, SummaryResource, account, rankCalc) {
		'use strict';

		$scope.gameId = $routeParams.gameId;
		$scope.account = account;
		$scope.rankCalc = rankCalc;
		$scope.summ = SummaryResource.get({gameId: $scope.gameId});
	});