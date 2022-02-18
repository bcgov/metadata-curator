# Changelog

<br />

## Version 1.3.0
February 22, 2022
 - Closing edition dialog with dataset tab resets the tab to the first one
 - Added number of records to data summary page
 - Added revisions to datasets, editions and schemas
 - Fixed an issue where file info wasn't saving on uploads
 - All form views have colons after each field label
 - Fixed issue preventing data approvers/admins from copying editions
 - Fixed another issue with comparison related to when a good match doesn't exist
 - Added ministry or organization to dataset page
 - Added create from this to create data upload based on dataset/version/schema combo
 - Added export option to edition
 - Added ability to filter by multiple variable classifications (matching any of the selected will show)
 - Changed published verison page to show name instead of guid for branch
 - Removed data upload id published version page
 - Added ability to filter datasets by ministry / organization

<br />

## Table Of Contents
- [Version 1.3.0 (February 22 2022)](#version-130)
- [Version 1.2.6 (February 14 2022)](#version-126)
- [Version 1.2.5 (February 9 2022)](#version-125)
- [Version 1.2.4 (February 7 2022)](#version-124)
- [Version 1.2.3 (February 1 2022)](#version-123)
- [Version 1.2.2 (January 27 2022)](#version-122)

<br />

## Version 1.2.6
February 14, 2022
 - Changed how all labels are displayed to support tooltips working when no information is in a field
 - Edition page now shows name instead of guid at the top when it has that information
 - Added helper text to field level (edition schema) "type"
 - Added helper text to field level (edition schema) "tag"
 - Made all resources start collapsed on basic schema page
 - Comparison issues
   - Fixed issue when there was a similar amount of things to reorder and one thing didn't have a 'good' match
   - Fixed issue when there was reordering and no difference in some of the later items
- Changed basic schema editing functionality to remove fields when they are blank rather than set them to blank
- Replaced "Enumeration Constraint" with "Field values"
- Closing edition dialog with dataset tab resets the tab to the first one
- Fixed issue with leaving schema page on upload and going back not showing results

<br />

## Version 1.2.5
February 9, 2022
 - Fixed bug setting the upload id on an edition from upload.
 - Fixed bug preventing setting of num records on files
 - Fixed issue that prevented Add comment below from working the second+ time it was pressed
 - Fixed an issue that prevented logout
 - Added ability to delete editions to admin
 - Data approvers will now be forced to select a provider group when creating a dataset or edition
 - Added * to denote required dataset field name
 - Added * to denote required schema fields resource.name resource.path and resource.field.name
 - Upgraded recent activity to allow getting the actual information that they have access to
 - Recent activity now also shows the most recent items for each category and links directly to them (capped at 10 per section)

<br />

## Version 1.2.4
February 7, 2022
 - Fixed issue where deleting a data upload would delete the oldest instead of the selected one
 - Changed selection of upload on edition to allow a searchable table
 - Added ability to collapse resources on schema view to improve navigation
 - Added close/back to schema compare page
 - Hyperlinked Data Upload on Edition page to the data upload it relates to (non edit only)
 - Made it so that field comments properly expand the field box when there is multiple
 - Fixed issue where select wasn't showing the proper display value
 - Removed approved versions from list on upload
 - Removed ability to create new datasets/editions on the upload page
 - Fixed issue where variable classifications would prevent basic view of schema
 - Added next button to top of compare schema on upload
 - Edition select on upload now saves information into the selected version to bind to the upload
    - This will warn if the edition has that information already but not prevent it from being overwritten
 - Added back/close, edit to top of schema page
 - Added dataset tab to schema page
    - This closes the dialog if your in a dialog, or shows you the dataset information if you aren't
 - Added Number of records to file info page for data type files

 <br />

## Version 1.2.3
February 1, 2022
 - Changed value and display for variable classification on schema to be "code. name"
 - Tightened validation on group select for approvers pre creating an upload
 - Tightened validation on version information for upload
 - Added ability for admin to delete uploads
 - Made save/cancel button float on schema (edition) edit page
 - Toggling highlight of a schema field will no longer close the dialog or go back to the list
 - Fixed description losing focus after anything is entered on upload file info page
 - Added first of filters to the basic schema view, allows filtering on variable classification.
 - Fixed issue updating variable classifications as non admin

 <br />

## Version 1.2.2 
January 27, 2022
 - Ability to toggle highlighting from the basic view screen
 - Saving changes to an edition stays on the edition page
 - Move "Add field" button on the schema to be on the left side
 - Improved resource "name" field helper text
 - Changed data format to yyyy-mm-dd for copied edition default name
 - Changed dataset level text re data provider approval
 - Fixed bug that allowed data provider to edit an approved edition
 - Improved ability to insert a field tag into a comment when in edit mode
 - Added "Collection Method" to the list of fields on the edition level
 - Added helper text for required fields on the upload wizard (dataset level)
 - Added ability to reorder fields (drag and drop)
 - Added ability to collapse field information on the schema basic view page
 - Added date picker to temporal fields at resource level on basic schema editor
 - Added this changelog and page to view
 - Added "Add Comment Below" Functionality to schema comment areas