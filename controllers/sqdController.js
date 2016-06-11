var sqdConfiguration = {
	sonarQubeUrl: "http://dev-brn-sonar-staging.swdev.local",
	projects: [
		{
			projectKey: "NCentral_AgentWindows_CurrentVersion",
			baselineDate: "2016-02-13T13:02:59+0100",
		},
		{
			projectKey: "NCentral_AgentWindows_SprintDSRCRSMRemoval",
			baselineDate: "2016-02-13T13:02:59+0100",
		},
	],
};

var app = angular.module("SonarQubeDashboardApp", ['ngCookies']);

app.controller("sqdController", function ($scope, $http, $cookies) {

	$scope.getMetrics = function() {
		$scope.projects = [];
		for (projectIndex = 0; projectIndex < sqdConfiguration.projects.length; projectIndex++) { 
			$scope.getMetricsForProject(projectIndex);
		}
	}

	$scope.getMetricsForProject = function(projectIndex) {
		var apiUrl = sqdConfiguration.sonarQubeUrl + "/api/timemachine/index?&metrics=duplicated_blocks,duplicated_lines,duplicated_lines_density,coverage,line_coverage,function_complexity,file_complexity,class_complexity";
		apiUrl += "&resource=" + sqdConfiguration.projects[projectIndex].projectKey;
		apiUrl += "&fromDateTime=" + sqdConfiguration.projects[projectIndex].baselineDate;
		
		$http.get(apiUrl)
			.success(function (response, status) {
				var coverage_index =
					duplicated_lines_density_index =
					function_complexity_index = 0;
				for (colIndex = 0; colIndex < response[0].cols.length; colIndex++) {
					switch (response[0].cols[colIndex].metric) {
						case "coverage":
							coverage_index = colIndex;
							break;
						case "duplicated_lines_density":
							duplicated_lines_density_index = colIndex;
							break;
						case "function_complexity":
							function_complexity_index = colIndex;
							break;
					}
				};
				var lastCell = response[0].cells[response[0].cells.length - 1];
				var project = {
					coverage: lastCell.v[coverage_index],
					duplicated_lines_density: lastCell.v[duplicated_lines_density_index],
					function_complexity: lastCell.v[function_complexity_index],
				};
				$scope.projects[projectIndex] = project;
			})
			.error(function (response, status) {
				alert('aaa');
			});
	}

	$scope.getMetrics();
});