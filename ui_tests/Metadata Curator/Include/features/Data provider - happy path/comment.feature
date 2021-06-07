@happypath
Feature: comment on upload
  As a data provider/metadata approver I need the ability to add a new comment to a data upload so that I can provide information or ask question about a data upload without needing to resort to emails

	@commentonupload
	Scenario: add comment to own upload
	Given Data provider has uploaded a data file
	When Data provider views the upload
	And Adds a comment
	Then Data provider sees their comment
	
	@commentonupload
	Scenario: view team member's comment on their upload
	Given Data provider team member has made a comment on their upload
	When Data provider views the upload
	Then Data provider sees team member comment
	
	@commentonupload
	Scenario: add comment to team member's upload
	Given Data provider team member has made a comment on their upload
	When Data provider views the upload
	Then Data provider sees team member comment