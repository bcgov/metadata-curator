Feature: Dataset
  As a data approver or provider I want to be able to make datasets to associate different uploads and editions

Scenario: Create Dataset
  Given Data approver successfully creates a dataset
		When Data approver chooses to see the details of the dataset
		Then Data approver should see information on the characteristics of the dataset


Scenario: Edit Dataset
  Given An open dataset ready browser
    When Data approver chooses to see the details of the dataset
		Then Data approver edits the dataset information
        When Data approver chooses to see the details of the dataset
		Then Data approver should see information on the characteristics of the dataset