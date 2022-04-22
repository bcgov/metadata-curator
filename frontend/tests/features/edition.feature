Feature: Edition
  As a data approver or provider I want to be able to make editions

Scenario: Create Edition
  Given Data approver successfully creates a dataset
    When Data approver chooses to see the details of the dataset
    When Data approver makes a new edition
    Then Data approver chooses to see the details of the edition
    Then Data approver should see information on the characteristics of the edition
    And the Data approver logs out


Scenario: Edit Edition
  Given the browser is dataset ready
    When Data approver chooses to see the details of the dataset
    Then Data approver chooses to see the details of the edition
    When Data approver edits the edition
    Then Data approver chooses to see the details of the edition
    Then Data approver should see information on the characteristics of the edition
    And the Data approver logs out