package test.mc.common

/**
 * MC Constants for Katalon
 * @author Paul Ripley
 */
public class Constant {
	Constant() {
		throw new UnsupportedOperationException();
	}

	static final def DEFAULT_TIMEOUT = 10

	final class Login {
		static final def LOGOUT_URL = '/auth/logout'
	}
	
	final class Navigation {
		static final def NEW_UPLOAD_BUTTON_TEXT = 'New Upload'
		static final def NEXT_BUTTON_TEXT = 'Next'
		static final def NEXT_BUTTON_2_ID = 'next-2'
		static final def NEXT_BUTTON_3_ID = 'next-3'
		static final def ADD_COMMENT_BUTTON_TEXT = 'Add Comment'
		static final def SAVE_BUTTON_TEXT = 'Save'
		static final def UPLOAD_BUTTON_ID = 'upload'
		static final def TAB_UPLOADS_ID = 'tab-uploads'
		static final def UPLOAD_DETAILS_BUTTON_TEXT = 'Upload & File Info'
	}
	
	final class UploadFormFields {
		static final def ORGANIZATION_NAME = 'data[ministryOrganization]'
		static final def ORGANIZATION_VALUE = 'My org' 
		static final def DATASET_NAME_NAME = 'data[datasetName]'
		//static final def DATASET_NAME_VALUE = 'My new dataset' //use a dynamically created value instead
		static final def DESCRIPTION_NAME = 'data[uploadDescription]'
		static final def DESCRIPTION_VALUE = 'description of my upload'
		static final def NUMFILES_NAME = 'data[numOfUploadFiles]'
		static final def NUMFILES_VALUE = '1'
		static final def DATERANGESTART_XPATH = "//input[@name='data[daterangestart]']/following-sibling::input[1]"
		static final def DATERANGESTART_VALUE = '2000-Jan-01'
		static final def SOURCESYSTEM_NAME = 'data[sourceSystem]'
		static final def SOURCESYSTEM_VALUE = 'source of my data'
		static final def DATERANGEEND_XPATH = "//input[@name='data[dateRangeEnd]']/following-sibling::input[1]"
		static final def DATERANGEEND_VALUE = '2020-Nov-30'
		static final def LINKINGINSTRUCTIONS_NAME = 'data[specificInstructionsAppendLink]'
		static final def LINKINGINSTRUCTIONS_VALUE = 'some linking instructions'
		static final def SENSITIVEFIELDS_NAME = 'data[sensitiveFields]'
		static final def SENSITIVEFIELDS_VALUE = 'field x, y and z are sensitive'
		static final def INCLUSIONS_NAME = 'data[inclusions]'
		static final def INCLUSIONS_VALUE = 'this is what is included'
		static final def EXCLUSIONS_NAME = 'data[exclusions]'
		static final def EXCLUSIONS_VALUE = 'some exclusions'
		static final def QUALITYINFO_NAME = 'data[qualityAccurancyInfo]'
		static final def QUALITYINFO_VALUE = 'some info about accuracy of the data'
		static final def DATACHANGESOVERTIME_NAME = 'data[dataChangesOverTime]'
		static final def DATACHANGESOVERTIME_VALUE = 'cha cha cha changes'
		static final def IMPORTANTINFO_NAME = 'data[importantAdditionalInfo]'
		static final def IMPORTANTINFO_VALUE = 'some important info'
		static final def REFERENCES_NAME = 'data[references]'
		static final def REFERENCES_VALUE = 'some references'
		static final def DATECREATED_XPATH = "//input[@name='data[createdUpdatedDate]']/following-sibling::input[1]"
		static final def DATECREATED_VALUE = '2020-Dec-04'
		static final def KEYWORDS_NAME = 'data[keywordsDescribingData]'
		static final def KEYWORDS_VALUE = 'test'
		static final def HYPERLINK_NAME = 'data[moreInfoUrl]'
		static final def HYPERLINK_VALUE = 'https://www2.gov.bc.ca/gov/content/data/about-data-management/data-innovation-program'
	}
	
	final class FileUpload {
		static final def UPLOAD_BUTTON_TYPE = 'file'
		static final def UPLOAD_FILE_NAME_1 = 'sports_accidents_bc_2017.csv'
		static final def UPLOAD_FILE_NAME_2 = 'sports_participation_bc_2017.csv'
	}
	
	final class UploadFileMetadata {
		static final def TITLE_XPATH = "//label[.='Title'][1]/following-sibling::input"
		static final def TITLE_VALUE = 'File title 1'
		static final def DESCRIPTION_XPATH = "//label[.='File'][1]/following-sibling::textarea"
		static final def DESCRIPTION_VALUE = 'my file description'
		static final def STARTDATE_XPATH = "/descendant::label[.='Date Range Start'][1]/following-sibling::input[1]"
		static final def STARTDATE_VALUE = '2019-12-01'
		static final def ENDDATE_XPATH = "/descendant::label[.='Date Range End'][1]/following-sibling::input[1]"
		static final def ENDDATE_VALUE = '2020-11-30'
	}
	
	final class UploadSummary {
		static final def UPLOAD_SUCCESS_TXT = 'Data Uploaded Successfully'
	}
}