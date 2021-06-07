@happypath
Feature: Upload data
  As a data provider I need the ability to have an upload summary generated and displayed based on the data I upload so that I can see if what I uploaded matches what I expected.

  @uploaddata
  Scenario: upload data
		Given Data provider successfully uploads a data file
		When Data provider chooses to see the details of the upload
		Then Data provider should see information on the characteristics of the data upload