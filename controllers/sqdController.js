﻿var sqdConfiguration = {
	sonarQubeUrl: "http://dev-brn-sonar-staging.swdev.local",
	projects: [
		{
			projectKey: "NCentral_AgentWindows_CurrentVersion",
			baselineDate: "2016-02-13T13:02:59+0100",
			name: "dev-10.3",
		},
		{
			projectKey: "NCentral_AgentWindows_SprintDSRCRSMRemoval",
			baselineDate: "2016-05-13T11:18:31+0200",
			name: "DSRC Removal",
		},
	],
};

var app = angular.module("SonarQubeDashboardApp", ['ngMaterial']);

app.controller("sqdController", function ($scope, $http) {

	$scope.getMetrics = function() {
		$scope.projects = [];
		for (projectIndex = 0; projectIndex < sqdConfiguration.projects.length; projectIndex++) { 
			$scope.projects[projectIndex] = { name: sqdConfiguration.projects[projectIndex].name, };
			/*
			// Debug function for converting the object into json string
			$scope.projects[projectIndex].json = function() {
				return JSON.stringify(this);
			}
			*/
			$scope.getMetricsForProject(projectIndex);
		}
	}

	$scope.getMetricsForProject = function(projectIndex) {
		var timemachineApiUrl = sqdConfiguration.sonarQubeUrl + "/api/timemachine/index?&metrics=duplicated_blocks,duplicated_lines,duplicated_lines_density,coverage,line_coverage,function_complexity,file_complexity,class_complexity";
		timemachineApiUrl += "&resource=" + sqdConfiguration.projects[projectIndex].projectKey;
		timemachineApiUrl += "&fromDateTime=" + encodeURIComponent(sqdConfiguration.projects[projectIndex].baselineDate);
		
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

		var issuesFirstApiUrl = sqdConfiguration.sonarQubeUrl + "/api/issues/search?resolved=false&ps=1";
		issuesFirstApiUrl += "&projectKeys=" + sqdConfiguration.projects[projectIndex].projectKey;
		issuesFirstApiUrl += "&createdBefore=" + encodeURIComponent(getOneSecondAfterBaselineDate(sqdConfiguration.projects[projectIndex].baselineDate));

		var issuesLastApiUrl = sqdConfiguration.sonarQubeUrl + "/api/issues/search?resolved=false&ps=1";
		issuesLastApiUrl += "&projectKeys=" + sqdConfiguration.projects[projectIndex].projectKey;
		
		$scope.projects[projectIndex].blockerIssues = {};
		$scope.projects[projectIndex].criticalIssues = {};
		$scope.projects[projectIndex].otherIssues = {};
		
		$http.get(issuesFirstApiUrl + "&severities=BLOCKER")
			.success(function (response, status) {
				$scope.projects[projectIndex].blockerIssues.first = response.total;
				$scope.projects[projectIndex].blockerIssues.diff = $scope.projects[projectIndex].blockerIssues.last - $scope.projects[projectIndex].blockerIssues.first;
			})
			.error(function (response, status) {
				alert('Error when getting metrics using ' + issuesFirstApiUrl);
			});
		
		$http.get(issuesFirstApiUrl + "&severities=CRITICAL")
			.success(function (response, status) {
				$scope.projects[projectIndex].criticalIssues.first = response.total;
				$scope.projects[projectIndex].criticalIssues.diff = $scope.projects[projectIndex].criticalIssues.last - $scope.projects[projectIndex].criticalIssues.first;
			})
			.error(function (response, status) {
				alert('Error when getting metrics using ' + issuesFirstApiUrl);
			});
		
		$http.get(issuesFirstApiUrl + "&severities=INFO,MINOR,MAJOR")
			.success(function (response, status) {
				$scope.projects[projectIndex].otherIssues.first = response.total;
				$scope.projects[projectIndex].otherIssues.diff = $scope.projects[projectIndex].otherIssues.last - $scope.projects[projectIndex].otherIssues.first;
			})
			.error(function (response, status) {
				alert('Error when getting metrics using ' + issuesFirstApiUrl);
			});

		
		$http.get(issuesLastApiUrl + "&severities=BLOCKER")
			.success(function (response, status) {
				$scope.projects[projectIndex].blockerIssues.last = response.total;
				$scope.projects[projectIndex].blockerIssues.diff = $scope.projects[projectIndex].blockerIssues.last - $scope.projects[projectIndex].blockerIssues.first;
			})
			.error(function (response, status) {
				alert('Error when getting metrics using ' + issuesLastApiUrl);
			});
		
		$http.get(issuesLastApiUrl + "&severities=CRITICAL")
			.success(function (response, status) {
				$scope.projects[projectIndex].criticalIssues.last = response.total;
				$scope.projects[projectIndex].criticalIssues.diff = $scope.projects[projectIndex].criticalIssues.last - $scope.projects[projectIndex].criticalIssues.first;
			})
			.error(function (response, status) {
				alert('Error when getting metrics using ' + issuesLastApiUrl);
			});
		
		$http.get(issuesLastApiUrl + "&severities=INFO,MINOR,MAJOR")
			.success(function (response, status) {
				$scope.projects[projectIndex].otherIssues.last = response.total;
				$scope.projects[projectIndex].otherIssues.diff = $scope.projects[projectIndex].otherIssues.last - $scope.projects[projectIndex].otherIssues.first;
			})
			.error(function (response, status) {
				alert('Error when getting metrics using ' + issuesLastApiUrl);
			});
			
	}
	
	function getOneSecondAfterBaselineDate(baselineDate) {
		var newBaselineDate = new Date(baselineDate);
		newBaselineDate.setSeconds(newBaselineDate.getSeconds() + 1);
		var newBaselineDateAsString = newBaselineDate.toISOString();
		newBaselineDateAsString = newBaselineDateAsString.substring(0, newBaselineDateAsString.length - 5);
		return newBaselineDateAsString + '+0000';
	}

	$scope.tests_getMetrics = function() {
		$scope.projects = [];
		
		$scope.projects[0] = {  
		   "name":"dev-10.3",
		   "blockerIssues":{  
			  "last":1,
			  "diff":0,
			  "first":1
		   },
		   "criticalIssues":{  
			  "first":180,
			  "diff":0,
			  "last":180
		   },
		   "otherIssues":{  
			  "first":17922,
			  "diff":33037,
			  "last":50959
		   },
		   "coverage":{  
			  "first":3.8,
			  "last":4.7,
			  "diff":0.9000000000000004
		   },
		   "functionComplexity":{  
			  "first":2.1,
			  "last":3.1,
			  "diff":1
		   },
		   "duplicatedLinesDensity":{  
			  "first":32.8,
			  "last":17.7,
			  "diff":-15.099999999999998
		   }
		};
		
		$scope.projects[1] = {
		   "name":"DSRC Removal",
		   "blockerIssues":{
			  "first":1,
			  "diff":0,
			  "last":1
		   },
		   "criticalIssues":{
			  "first":203,
			  "diff":0,
			  "last":203
		   },
		   "otherIssues":{
			  "first":63999,
			  "diff":460,
			  "last":64459
		   },
		   "coverage":{
			  "first":3.8,
			  "last":4.6,
			  "diff":0.7999999999999998
		   },
		   "functionComplexity":{
			  "first":2.1,
			  "last":2.1,
			  "diff":0
		   },
		   "duplicatedLinesDensity":{
			  "first":32.8,
			  "last":32.9,
			  "diff":0.10000000000000142
		   }
		};
	}

	$scope.tests_getMetrics();
	// $scope.getMetrics();
});