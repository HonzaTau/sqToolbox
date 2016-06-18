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
				var coverageIndex =
					duplicatedLinesDensityIndex =
					functionComplexityIndex = 0;
				for (colIndex = 0; colIndex < response[0].cols.length; colIndex++) {
					switch (response[0].cols[colIndex].metric) {
						case "coverage":
							coverageIndex = colIndex;
							break;
						case "duplicated_lines_density":
							duplicatedLinesDensityIndex = colIndex;
							break;
						case "function_complexity":
							functionComplexityIndex = colIndex;
							break;
					}
				};
				var firstCell = response[0].cells[0];
				var lastCell = response[0].cells[response[0].cells.length - 1];
				
				$scope.projects[projectIndex].coverage = {
					first: firstCell.v[coverageIndex],
					last:  lastCell.v[coverageIndex],
					diff:  lastCell.v[coverageIndex] - firstCell.v[coverageIndex],
				};
				$scope.projects[projectIndex].functionComplexity = {
					first: firstCell.v[functionComplexityIndex],
					last:  lastCell.v[functionComplexityIndex],
					diff:  lastCell.v[functionComplexityIndex] - firstCell.v[functionComplexityIndex],
				};
				$scope.projects[projectIndex].duplicatedLinesDensity = {
					first: firstCell.v[duplicatedLinesDensityIndex],
					last:  lastCell.v[duplicatedLinesDensityIndex],
					diff:  lastCell.v[duplicatedLinesDensityIndex] - firstCell.v[duplicatedLinesDensityIndex],
				};
			})
			.error(function (response, status) {
				alert('Error when getting metrics using ' + timemachineApiUrl);
			});
			
		var issuesApiUrl = sqdConfiguration.sonarQubeUrl + "/api/issues/search?resolved=false&ps=1";
		issuesApiUrl += "&projectKeys=" + sqdConfiguration.projects[projectIndex].projectKey;
		issuesApiUrl += "&createdAfter=" + sqdConfiguration.projects[projectIndex].baselineDate;
		
		$http.get(issuesApiUrl + "&severities=BLOCKER")
			.success(function (response, status) {
				$scope.projects[projectIndex].blockerIssues = {
					diff: response.total,
				};
			})
			.error(function (response, status) {
				alert('Error when getting metrics using ' + issuesApiUrl);
			});
		
		$http.get(issuesApiUrl + "&severities=CRITICAL")
			.success(function (response, status) {
				$scope.projects[projectIndex].criticalIssues = {
					diff: response.total,
				};
			})
			.error(function (response, status) {
				alert('Error when getting metrics using ' + issuesApiUrl);
			});
		
		$http.get(issuesApiUrl + "&severities=INFO,MINOR,MAJOR")
			.success(function (response, status) {
				$scope.projects[projectIndex].otherIssues = {
					diff: response.total,
				};
			})
			.error(function (response, status) {
				alert('Error when getting metrics using ' + issuesApiUrl);
			});
		
	}

	$scope.getMetrics();
});