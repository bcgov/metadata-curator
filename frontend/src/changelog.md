# Changelog

<br />

## Version 2.0.0
June 20 2023
 - Authentication no longer a requirement and the following sections have been modified to allow access (Datasets, Editions, Variable Classifications, Home). Access is only granted to published things. Datasets are considered published if at least one of their editions is published
 - Added temporal fields, number of fields and type to resources in edition files and fields

 <br />

## Table Of Contents
- [Version 2.0.0 (June 20 2023)](#version-200)
- [Version 1.7.1 (June 2 2023)](#version-171)
- [Version 1.7.0 (May 15 2023)](#version-170)
- [Version 1.6.9 (April 27 2023)](#version-169)
- [Version 1.6.8 (March 31 2023)](#version-168)
- [Version 1.6.7 (March 21 2023)](#version-167)
- [Version 1.6.6 (March 15 2023)](#version-166)
- [Version 1.6.5 (January 7 2023)](#version-165)
- [Version 1.6.4 (November 18 2022)](#version-164)
- [Version 1.6.3 (November 2 2022)](#version-163)
- [Version 1.6.2 (September 19 2022)](#version-162)
- [Version 1.6.1 (September 16 2022)](#version-161)
- [Version 1.6.0 (August 11 2022)](#version-160)
- [Version 1.5.5 (July 26 2022)](#version-155)
- [Version 1.5.4 (July 21 2022)](#version-154)
- [Version 1.5.3 (June 17 2022)](#version-153)
- [Version 1.5.2 (June 2 2022)](#version-152)
- [Version 1.5.1 (May 18 2022)](#version-151)
- [Version 1.5.0 (May 9 2022)](#version-150)
- [Version 1.4.6 (April 28 2022)](#version-146)
- [Version 1.4.5 (April 27 2022)](#version-145)
- [Version 1.4.4 (April 25 2022)](#version-144)
- [Version 1.4.3 (April 22 2022)](#version-143)
- [Version 1.4.2 (March 25 2022)](#version-142)
- [Version 1.4.1 (March 18 2022)](#version-141)
- [Version 1.4.0 (March 16 2022)](#version-140)
- [Version 1.3.7 (March 10 2022)](#version-137)
- [Version 1.3.6 (March 10 2022)](#version-136)
- [Version 1.3.5 (March 8 2022)](#version-135)
- [Version 1.3.4 (March 2 2022)](#version-134)
- [Version 1.3.3 (March 1 2022)](#version-133)
- [Version 1.3.2 (February 25 2022)](#version-132)
- [Version 1.3.1 (February 23 2022)](#version-131)
- [Version 1.3.0 (February 22 2022)](#version-130)
- [Version 1.2.6 (February 14 2022)](#version-126)
- [Version 1.2.5 (February 9 2022)](#version-125)
- [Version 1.2.4 (February 7 2022)](#version-124)
- [Version 1.2.3 (February 1 2022)](#version-123)
- [Version 1.2.2 (January 27 2022)](#version-122)

<br />

## Version 1.7.1
June 2 2023
 - Fixed bugs around published editions

 <br />

## Version 1.7.0
May 15, 2023
 - Removed Field Notes from BCDC black list (it will now be published)
 - Fixed issue preventing a logged in user with no permissions from viewing a published record (requires forum Api 3.1.6)
 - Added formatting to json resource being published to BCDC (it will now use 4 spaces and new lines)

 <br />

## Version 1.6.9
April 27, 2023
 - Fix to editions not loading

 <br />

## Version 1.6.8
March 31, 2023
 - Change File Uploader to just show upload complete and file name when done

 <br />

## Version 1.6.7
March 21, 2023
 - Disable resume on file upload the logic is complicated and doesn't work properly

<br />

## Version 1.6.6
March 15, 2023
 - Created script in util folder that takes parameters to delete files older than a certain date
 - Changed dataset description field to be a text area instead of a text input so that it can be expanded
 - Added handling for brackets "()" in the BCDC functionality
 - Fixed script for noauth to also have cors allowed on files and removed body limit for minio
 - Fixed large upload issue which was caused by tus-js-client keeping the encrypted file contents in memory
 - Updated tus-js-client to newest
 - Create dataset validation error fixed to show field specific errors.
 - Fixed comments to show beside their corresponding resource when the resource name contains a space.
 - Prevent edition files and fields from being saved when two resources have the same name.
 - Added ability to scroll to the top of edition files and fields.
 - Added ability to denote primary anf foreign keys in resources
 - Added ability to specify more than one file per resource.

<br />

## Version 1.6.5
January 7, 2023
 - Added all files report to dataset which is the same as all fields without the field information from files and fields
 - Fixed issue preventing dragging fields around for reordering on files and fields after entering a text field
 - Tentative fix for edition full 500 error
 - Fixed an issue that allowed uploaders to create an upload without an approver if they did it in a fresh session (incognito)
 - Updated Terraform deployment reference to new updated tusd_py3 docker image
 - Updated syntax in pre-create tusd_py3 hook script
<br />

## Version 1.6.4
November 18, 2022
 - Fixed bug with supplemental files

<br />

## Version 1.6.3
November 2, 2022
 - Fixed bug with tagged report not filtering properly since the change to multiselect.
 - Added Dataset refresh status field to datasets, reworked several fields and possible values
 - Fixed position of edit save floating buttons on schema page
 - Changed alert success/error banners to be sticky to that you can see them no matter where you are on the page
 - Fixed issue with ellipsis and visibility of description when not expanded on files and fields
 - Files and fields field description shows full description when hovered in the collapsed view
 - Added all fields report to dataset list
 - Enhanced support for text selection on resource fields
 - Added ability to copy a field between resources on the files and fields tab
 - Changed functionality of search dataset name on the dataset list screen to typeahead with dataset names selectable
 - Changed caption of filter box to Search/Filter on the dataset list screen
 - Sorted the data provider groups on the dataset and edition create page.

<br />

## Version 1.6.2
September 19, 2022
 - Ministry / Organization field converted to select typeahead settable via options as ministry_organization
 - Moved and renamed In BC Data Catalogue field on the dataset page to BCDC and the allow publish section
 - Added ability to see the selected data provider group on datasets/editions
 - Added Role to dataset contacts

 <br />

## Version 1.6.1
September 16, 2022
 - Added support for ignore groups
 - Added "Not classified" to filter on files & fields filter
 - Fixed issue with viewing editions with schema revisions
 - Fixed losing place when updating highlight on files and fields in non edit mode

<br />

## Version 1.6.0
August 11, 2022
 - Added a way to delete supplemental files
 - Added a confirm button, this is used to make sure you want to delete the file noted above
 - Added checksums (md5) for uploaded files, these will be present in the .info files
 - Added support for Selects to be typeahead, and used this on the edition list page for filter
 - Made field description and variable classification show in the collapsed view mode
 - Field description will show ellipsisd in collapsed view only when longer than one line
 - Made the edit/close/save buttons float in view mode for files and fields

 <br />

## Version 1.5.5
July 26, 2022
 - Terraform fixes for supplemental files

<br />

## Version 1.5.4
July 21, 2022
 - Reenabled parallel encyption and chunking
 - Fixed issue with add/remove files showing in incorrect order
 - Tags now multiselect on schema
 - Tags now multiselect for filter on dataset page, results will be datasets that have both of the tags present
 - Selects will now add non existent values to the list of values. This allows for instance tags that are not in the possible list of values to still show up
 - Temporal fields is a new optional field on upload for data type files.
 - Updated edition page to use markdown for all text areas
 - Updated bcdc push logic to always use data innovation program for published by and to add source system to lineage statement if it has one
 - Added dataset name to edition tab of datasets
 - Added dataset name to edition list, it is now the first line of text under the edition name (the edition description is now below dataset name)
 - Added additional fields as markdown to the edition page that were previously text inputs
 - Notes and description changed to markdown on schema. IF USED THIS WILL AFFECT THE JSON
 - Published Edition page now has many more fields that exist on non published one
 - Published Edition has dataset name larger to closer match non published page
 - When selecting a group to create an edition/dataset/upload for it now will remove ones that don't match a configurable field
 - Fixed Edition filters to properly work with all datasets again, also removed sort from the filter boxes on this page as it was confusing having "All" and "None" in the middle of the list
 - Added edition name when using "Create from this" for upload creation
 - Changed Compare tab label to Compare Inferred
 - Bumped api size limit from 100kb to 50mb
 - Fixed a bug causing notifications and upload date to change when approvers viewed

 <br />

## Version 1.5.3
June 17, 2022
 - All selects are now alphabetically sorted by default (can be turned off)
 - The dataset list now allows sorting by name, create date or ministry / organization ascending or descending
 - The editions have moved to a tab in the dataset page
 - Editions can now be sorted by name or create date and ascending or descending on the dataset page
 - Variable Classifications has been renamed to Classification Ind(ex/icies) in that area of the program
 - Fixed an issue with large file encryption. This requires decryptor to seperate file on messages

<br />

## Version 1.5.2
June 2, 2022
 - Fixed a bug causing changing highlight in non edit mode to bail out to the version list.
 - Added duplicate field name highlight to the comparison mode
 - Fixed bug with removing a file on upload
 - Field comments can no longer be expanded or collapsed, they are always expanded
 - Significantly shrinked the size of data used for inferrence and read from file (.5mb from 1 and 1000 rows from full 1mb)
 - Changed delimiter support for csv to support ",", ", ", "|", and "| "
 - Name search on files and fields is now case insensitive
 - Allowed the Terraform setup to change the forum api email contents
 - Fixes to Terraform related to accessing version directly

 <br />

## Version 1.5.1
May 18, 2022
 - Update labels and helper text on dataset page
 - Add new fields to dataset page
 - Better organized files
 - Update labels and helper text on edition page
 - Add new fields to edition page
 - Update labels and helper text on edition files and fields tab
 - Fixed variable classification and highlight filter being unfiltered on files and fields
 - Changed how file and fields revisions are shown

<br />

## Version 1.5.0
May 9, 2022
 - First draft of dataset reports, includes 'tagged fields' report
 - Added a supplemental information tab to editions
 - Removed comment button from published view of an edition (which didn't work)
 - Removed comment section from published view of an edition (as it doesn't work)
 - Removed highlight field from published view of an edition (as the field either is or is not highlighted)

<br />

## Version 1.4.6
April 28, 2022
 - This release contains changes for the terraform version

<br />

## Version 1.4.5
April 27, 2022
 - Removed blank option from dataset list ministry organization filter
 - Fields and resources with spaces in the name replace with a + for the comment link to make them work
 - Duplicate fields (same field name in a resource) in files & fields will be flagged with a red border and an alert will be displayed at the top
 - Made field notes a text area (files and fields tab)
 - Publish to BCDC now adds "- [Edition name]" to the dataset

<br />

## Version 1.4.4
April 25, 2022
 - Fixed edit button not showing on approved editions for approvers
 - Fixed left message when a user is on nothing and closes browser getting sent to people also on nothing
 - Removed requirement for a upload to publish to the catalogue
 - Added name to dataset list filter
 - Allowed multiple select of ministry on dataset list
 - Switched to semantic infer from data package infer to infer more information about fields
 - After switching to default collapsed for resources/fields on files and fields tab of editions comments no longer hyperlinked
   - The link doesn't make sense when closed as is as the field isn't visible therefore...
   - Greatly changed how this works and will now treat ALL instances of !stuff.moreStuff as a link
   - These links only work on the edition page
   - If you are on the edition page you will get moved to the files and fields tab (so you can direct link to a field)
   - If you are on the files and fields tab the resource and field will be opened up and then you will be scrolled to it
- Added number of fields to comparison

<br />

## Version 1.4.3
April 22, 2022
 - Increased clarity of BCDC publishing
 - Enhanced social and dialog feel of comment areas
 - Increased datepicker usability especially when picking years and or months
 - Fixed a bug preventing editing of dataset checkboxes to unchecked or clearing of fields after initial create
 - No longer copies published or approved values when copying a version
 - Added more integration tests for datasets/editions/schemas
 - Improved error handling on schema tab
 - Allowed editors to edit approved editions
 - Added resource notes to resource level of files and fields
 - Updated terraform scripts to give proper permissions to approvers and to enable phase 3 by default (for automated testing)
 - Only call upload hook when an upload is updated to submission if the original status wasn't submitted (IE it just became submitted)
 - Fixed public editions not showing when not logged in
 - Added recently commented on items to activity feed
 - Added real time notifications for comments
 - Added real time notifications for who else is on a record
 - Comparison now shows a value Not Specified for fields that don't exist
 - Comparison now ellipsis fields longer than one line
 - Comparison now allows collapse of resources and fields
 - Comparison compares better matches
 - Fixed some comparison colouring bigs
 - Added resources to comparison
 - Fixed comparison not aligning fields that it's compared against


<br />

## Version 1.4.2
March 25, 2022
 - BC Data Catalogue record creation (Phase 3)
 - Field type in Files & Fields is now a select with the frictionless standard options
 - Prevented jump to top when adding a new field in the files & fields area
 - Changed drag functionality to reorder fields to be cascade instead of swap
 - Added number of fields to the top of a resource as an informative label on files & fields
 - Changed - icon to remove a field to be a trash can and to the far right
 - Fixed exporting resource level fields
 - Strengthened ability of login to persist across server restarts
 - Showed a banner when the call to keep you logged in fails to do so
 - Moved edition page to a 2 column layout
 - Fixed some visual issues with checkboxes (being large, and wrong colour/size font)
 - Cleaned up data upload summary form

## Version 1.4.1
March 18, 2022
 - Fixed some error messages on dataset form
 - Fixed back button on edition schema form
 - Fixed comparison when file provided has less columns then expected
 - Removed popups from completed upload page
 - Fixed upload page not going to view page on a submitted upload

<br />

## Version 1.4.0
March 16, 2022
 - Fixed about page crashing server
 - Fully removed formio
 - Added highlight filter to edition file & field info page
 - Changed Schema label to files & fields
 - Redesigned user page, feature BCDC fields if phase 3 is enabled
 - Fields are collapsed in view mode initially after expanding a file
 - Fixed error with required date fields reporting an error erroneously sometimes
 - Fixed error that made the home page occasionally appear blank
 - Changed dataset page to link to edition page instead of be a pop up
 - Forced file info number of records to be a number
 - Fixed issue saving inferred metadata
 - Added old_submission to admin tab for data uploads
 - Fixed back button on edition page to take you to edition list
 - Made Ministry/Organization a required dataset field
 - Renamed comments at files & fields level to notes
 - Changed error text for trying to copy an edition without file & field info
 - Fixed previous version being opened when opening a version after just creating a new version

<br />

## Version 1.3.7
March 10, 2022
 - Fixed enforcing number of records to be set
 - Fixed error where if type was the last thing set on file info it wasn't saved

<br />

## Version 1.3.6
March 10, 2022
 - Fixed issue preventing data providers from going back from file select form
 - Upload wizard changed to say "Save & Next" when it actually saves and to use primary color on those buttons
 - Darkened success green in dark and light themes for visibility
 - Fixed logic for File Info form around the default type selected
 - Added drag icon to fields in json editor basic mode when editing
 - Changed translation for schema to "File & Field Level"
 - Added dataset filter to Edition list page
 - Made number of records a required via ui field

<br />

## Version 1.3.5
March 8, 2022
 - Removed formio
 - Fixed issue preventing selection of variable classification index when creating an edition initially
 - Fixed error preventing create edition from this working
 - Added none to the edition filter list to find editions without uploads
 - Fixed issue making the wrong version be selected with create edition from this

<br />

## Version 1.3.4
March 2, 2022
 - Fixed issue with updating a dataset
 - File form alerts user if 0 number of files was provided on the initial submission
 - Fixed issues with create upload from this
   - Fail more gracefully if keywords aren't set (it's required on the default upload form)
 - Fixed incorrect link when upload is submitted on dataset/uploads tab
 - Fixed issue with exporting filtered fields
 - Fixed issue with updating data upload from the edition page
 - Prevent data providers from attaching upload to edition via edition page/api

<br />

## Version 1.3.3
March 1, 2022
 - Updated terraform scripts to be even more lenient with connection timeouts for large files
 - Fixed variable_classification_index not exporting
 - Upgrades to storage api
 - Fix issue regarding export all when the edition does not have a schema
 - Increased blue "primary" contrast in dark mode
 - Schema filter now persists through export


<br />

## Version 1.3.2
February 25, 2022
 - Changed Variable Classification export to be _index_name and _index_id
 - Changed label on Edition to be Variable Classification Index for clarity
 - Made name a unique field on variable classifications
 - Fixed error handling when saving variable classifications
 - Published Edition page shows variable classification index name instead of guid if it can get it, if it can't it is hidden
 - Added check and uncheck all buttons to export
 - Fixed header always being grey in export dialog
 - Added 9 new fields to edition level
 - Changed bindings on create new upload from this
 - New Upload from this now sets field on edition level and preemptively saves the upload (this is all required)


<br />

## Version 1.3.1
February 23, 2022
 - Fixed ability to export
 - Edition page won't allow to proceed if any fields are missing
 - Prevented copy from working when the edition doesn't have a schema

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
