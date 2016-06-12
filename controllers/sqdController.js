var sqdConfiguration = {
	sonarQubeUrl: "http://dev-brn-sonar-staging.swdev.local",
	projects: [
		{
			projectKey: "NCentral_AgentWindows_CurrentVersion",
			baselineDate: "2016-02-13T13:02:59%2b0100",
			name: "dev-10.3",
		},
		{
			projectKey: "NCentral_AgentWindows_SprintDSRCRSMRemoval",
			baselineDate: "2016-02-13T13:02:59%2b0100",
			name: "DSRC Removal",
		},
	],
};

var app = angular.module("SonarQubeDashboardApp", ['ngCookies']);

app.controller("sqdController", function ($scope, $http, $cookies) {

	$scope.getMetrics = function() {
		$scope.projects = [];
		for (projectIndex = 0; projectIndex < sqdConfiguration.projects.length; projectIndex++) { 
			$scope.projects[projectIndex] = { name: sqdConfiguration.projects[projectIndex].name, };
			$scope.getMetricsForProject(projectIndex);
		}
	}

	$scope.getMetricsForProject = function(projectIndex) {
		var timemachineApiUrl = sqdConfiguration.sonarQubeUrl + "/api/timemachine/index?&metrics=duplicated_blocks,duplicated_lines,duplicated_lines_density,coverage,line_coverage,function_complexity,file_complexity,class_complexity";
		timemachineApiUrl += "&resource=" + sqdConfiguration.projects[projectIndex].projectKey;
		timemachineApiUrl += "&fromDateTime=" + sqdConfiguration.projects[projectIndex].baselineDate;
		
		$http.get(timemachineApiUrl)
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
				var firstCell = response[0].cells[0];
				var lastCell = response[0].cells[response[0].cells.length - 1];
				
				$scope.projects[projectIndex].coverage = lastCell.v[coverage_index];
				$scope.projects[projectIndex].coverage_diff = lastCell.v[coverage_index] - firstCell.v[coverage_index];
				$scope.projects[projectIndex].function_complexity = lastCell.v[function_complexity_index];
				$scope.projects[projectIndex].function_complexity_diff = lastCell.v[function_complexity_index] - firstCell.v[function_complexity_index];
				$scope.projects[projectIndex].duplicated_lines_density = lastCell.v[duplicated_lines_density_index];
				$scope.projects[projectIndex].duplicated_lines_density_diff = lastCell.v[duplicated_lines_density_index] - firstCell.v[duplicated_lines_density_index];
			})
			.error(function (response, status) {
				alert('Error when getting metrics using ' + timemachineApiUrl);
			});
			
		var issuesApiUrl = sqdConfiguration.sonarQubeUrl + "/api/issues/search?resolved=false&ps=1";
		issuesApiUrl += "&projectKeys=" + sqdConfiguration.projects[projectIndex].projectKey;
		issuesApiUrl += "&createdAfter=" + sqdConfiguration.projects[projectIndex].baselineDate;
		
		$http.get(issuesApiUrl + "&severities=BLOCKER")
			.success(function (response, status) {
				$scope.projects[projectIndex].blocker_issues = response.total;
			})
			.error(function (response, status) {
				alert('Error when getting metrics using ' + issuesApiUrl);
			});
		
		$http.get(issuesApiUrl + "&severities=CRITICAL")
			.success(function (response, status) {
				$scope.projects[projectIndex].critical_issues = response.total;
			})
			.error(function (response, status) {
				alert('Error when getting metrics using ' + issuesApiUrl);
			});
		
		$http.get(issuesApiUrl + "&severities=INFO,MINOR,MAJOR")
			.success(function (response, status) {
				$scope.projects[projectIndex].minor_issues = response.total;
			})
			.error(function (response, status) {
				alert('Error when getting metrics using ' + issuesApiUrl);
			});
		
	}

	$scope.getMetrics();
});