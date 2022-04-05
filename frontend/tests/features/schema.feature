Feature: Edition Schema
  As a data provider I need the ability to create schema defining the data in an edition

Scenario: Create Schema
  Given the browser is dataset ready
    When Data approver chooses to see the details of the dataset
    Then Data approver chooses to see the details of the edition
    When the user is on the files and fields tab
    Then They should be able to upload a data package
    When they create without import
    And they provide schema information
    And they choose to view schema information
    Then they should see the schema information
