var sqdConfiguration = {
	sonarQubeUrl: "http://dev-brn-sonar-staging.swdev.local",
	projects: [
		{
			projectKey: "NCentral_AgentWindows_CurrentVersion",
			baselineDate: "2016-02-13T13:02:59+0100",
		},
	],
};

var app = angular.module("SonarQubeDashboardApp", ['ngCookies']);

app.controller("sqdController", function ($scope, $http, $cookies) {

	$scope.getMetrics = function getMetrics() {
		$scope.projects = [];
		$http.get(sqdConfiguration.sonarQubeUrl + "/api/timemachine/index?resource=" + sqdConfiguration.projects[0].projectKey + "&metrics=duplicated_blocks,duplicated_lines,duplicated_lines_density,coverage,line_coverage,function_complexity,file_complexity,class_complexity&fromDateTime=" + sqdConfiguration.projects[0].baselineDate)
			.success(function (response, status) {
				var project = {
					coverage: response[0].cells[0].v[1],
				};
				$scope.projects.push(project);
			})
			.error(function (response, status) {
				alert('aaa');
			});
	}

	$scope.getMetrics();
});