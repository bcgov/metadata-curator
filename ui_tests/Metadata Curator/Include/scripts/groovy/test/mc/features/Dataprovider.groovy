package test.mc.features
import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint

import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject

import com.kms.katalon.core.annotation.Keyword
import com.kms.katalon.core.checkpoint.Checkpoint
import com.kms.katalon.core.checkpoint.CheckpointFactory
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.testcase.TestCase
import com.kms.katalon.core.testcase.TestCaseFactory
import com.kms.katalon.core.testdata.TestData
import com.kms.katalon.core.testdata.TestDataFactory
import com.kms.katalon.core.testobject.ObjectRepository
import com.kms.katalon.core.testobject.TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import org.openqa.selenium.Keys as Keys
import com.kms.katalon.core.webui.common.WebUiCommonHelper
import internal.GlobalVariable

import org.openqa.selenium.WebElement
import org.openqa.selenium.WebDriver
import org.openqa.selenium.By

import com.kms.katalon.core.mobile.keyword.internal.MobileDriverFactory
import com.kms.katalon.core.webui.driver.DriverFactory

import com.kms.katalon.core.testobject.RequestObject
import com.kms.katalon.core.testobject.ResponseObject
import com.kms.katalon.core.testobject.ConditionType
import com.kms.katalon.core.testobject.TestObjectProperty

import com.kms.katalon.core.mobile.helper.MobileElementCommonHelper
import com.kms.katalon.core.util.KeywordUtil

import com.kms.katalon.core.webui.exception.WebElementNotFoundException

import cucumber.api.java.en.And
import cucumber.api.java.en.Given
import cucumber.api.java.en.Then
import cucumber.api.java.en.When

import test.mc.common.Constant
import test.mc.common.Utils
import test.mc.common.Step
import java.text.DateFormat
import java.text.SimpleDateFormat

public class Dataprovider extends Step {
	@Delegate Login ls
	public Dataprovider() {
		ls = new Login()
	}
	
	/**
	 * The step definitions below match with Katalon sample Gherkin steps
	 */
	@Given("Data provider successfully uploads a data file")
	def dp_upload_happy_path() {
		ls.user_login('data provider')
		Utils.click(Utils.getTestObjectByText(" Uploads "))
		G_DATESETNAME = Utils.generateDateSetNameDate()
		Utils.click(Utils.getTestObjectByText(Constant.Navigation.NEW_UPLOAD_BUTTON_TEXT))
		Utils.setText(Utils.getTestObjectByName(Constant.UploadFormFields.ORGANIZATION_NAME), Constant.UploadFormFields.ORGANIZATION_VALUE)
		Utils.setText(Utils.getTestObjectByName(Constant.UploadFormFields.DATASET_NAME_NAME), G_DATESETNAME)
		Utils.setText(Utils.getTestObjectByName(Constant.UploadFormFields.DESCRIPTION_NAME), Constant.UploadFormFields.DESCRIPTION_VALUE)
		Utils.setText(Utils.getTestObjectByName(Constant.UploadFormFields.NUMFILES_NAME), Constant.UploadFormFields.NUMFILES_VALUE)
		Utils.setText(Utils.getTestObjectByXPath(Constant.UploadFormFields.DATERANGESTART_XPATH), Constant.UploadFormFields.DATERANGESTART_VALUE)
		Utils.setText(Utils.getTestObjectByXPath(Constant.UploadFormFields.DATERANGEEND_XPATH), Constant.UploadFormFields.DATERANGEEND_VALUE)
		Utils.setText(Utils.getTestObjectByName(Constant.UploadFormFields.LINKINGINSTRUCTIONS_NAME), Constant.UploadFormFields.LINKINGINSTRUCTIONS_VALUE)
		Utils.setText(Utils.getTestObjectByName(Constant.UploadFormFields.SENSITIVEFIELDS_NAME), Constant.UploadFormFields.SENSITIVEFIELDS_VALUE)
		Utils.setText(Utils.getTestObjectByName(Constant.UploadFormFields.INCLUSIONS_NAME), Constant.UploadFormFields.INCLUSIONS_VALUE)
		Utils.setText(Utils.getTestObjectByName(Constant.UploadFormFields.EXCLUSIONS_NAME), Constant.UploadFormFields.EXCLUSIONS_VALUE)
		Utils.setText(Utils.getTestObjectByName(Constant.UploadFormFields.QUALITYINFO_NAME), Constant.UploadFormFields.QUALITYINFO_VALUE)
		Utils.setText(Utils.getTestObjectByName(Constant.UploadFormFields.DATACHANGESOVERTIME_NAME), Constant.UploadFormFields.DATACHANGESOVERTIME_VALUE)
		Utils.setText(Utils.getTestObjectByName(Constant.UploadFormFields.IMPORTANTINFO_NAME), Constant.UploadFormFields.IMPORTANTINFO_VALUE)
		Utils.setText(Utils.getTestObjectByName(Constant.UploadFormFields.REFERENCES_NAME), Constant.UploadFormFields.REFERENCES_VALUE)
		Utils.setText(Utils.getTestObjectByXPath(Constant.UploadFormFields.DATECREATED_XPATH), Constant.UploadFormFields.DATECREATED_VALUE)
		Utils.setText(Utils.getTestObjectByName(Constant.UploadFormFields.KEYWORDS_NAME), Constant.UploadFormFields.KEYWORDS_VALUE)
		Utils.setText(Utils.getTestObjectByName(Constant.UploadFormFields.HYPERLINK_NAME), Constant.UploadFormFields.HYPERLINK_VALUE)
		Utils.click(Utils.getTestObjectByText(Constant.Navigation.NEXT_BUTTON_TEXT, null))
		
		//Upload file screen - upload 2 files
		TestObject uploadBtn = Utils.getTestObjectByType(Constant.FileUpload.UPLOAD_BUTTON_TYPE)
		Utils.waitClickable(uploadBtn)
		WebUI.sendKeys(uploadBtn, "$GlobalVariable.TEST_FILE_PATH$Constant.FileUpload.UPLOAD_FILE_NAME_1")
		WebUI.sendKeys(uploadBtn, "$GlobalVariable.TEST_FILE_PATH$Constant.FileUpload.UPLOAD_FILE_NAME_2")
		Utils.click(Utils.getTestObjectById(Constant.Navigation.NEXT_BUTTON_2_ID))
		
		//File level metadata screen - fill out the file level metadata.  Keep one as a control.
		Utils.setText(Utils.getTestObjectByXPath(Constant.UploadFileMetadata.DESCRIPTION_XPATH), Constant.UploadFileMetadata.DESCRIPTION_VALUE, 1)
		TestObject titleObj = Utils.getTestObjectByXPath(Constant.UploadFileMetadata.TITLE_XPATH)
		//WebUI.clearText(titleObj)
		WebUI.doubleClick(titleObj)
		WebUI.sendKeys(titleObj, Keys.chord(Keys.CONTROL, 'a'))
		WebUI.sendKeys(titleObj, Keys.chord(Keys.DELETE))		
		Utils.setText(titleObj, Constant.UploadFileMetadata.TITLE_VALUE, 1)
		
		Utils.click(Utils.getTestObjectByXPath(Constant.UploadFileMetadata.STARTDATE_XPATH))
		TestObject sd = Utils.getTestObjectByXPath(Constant.UploadFileMetadata.STARTDATE_XPATH)		
		WebUI.executeJavaScript('document.getElementById("' + WebUI.getAttribute(sd, 'id') + '").removeAttribute("readonly")', null)
		WebUI.delay(1)
		Utils.setText(sd, Constant.UploadFileMetadata.STARTDATE_VALUE)
		
		Utils.click(Utils.getTestObjectByXPath(Constant.UploadFileMetadata.ENDDATE_XPATH))
		TestObject ed = Utils.getTestObjectByXPath(Constant.UploadFileMetadata.ENDDATE_XPATH)
		WebUI.executeJavaScript('document.getElementById("' + WebUI.getAttribute(ed, 'id') + '").removeAttribute("readonly")', null)
		WebUI.delay(1)
		Utils.setText(ed, Constant.UploadFileMetadata.ENDDATE_VALUE)
		
		WebUI.delay(1)
		Utils.click(Utils.getTestObjectById(Constant.Navigation.NEXT_BUTTON_3_ID))
		
		//Initiate upload screen - start the encryption/upload
		Utils.click(Utils.getTestObjectById(Constant.Navigation.UPLOAD_BUTTON_ID))
		
		//Upload summary screen - look for success complete
		WebUI.waitForElementPresent(Utils.getTestObjectByText(Constant.UploadSummary.UPLOAD_SUCCESS_TXT), Constant.DEFAULT_TIMEOUT)
		WebUI.verifyTextPresent(Constant.UploadSummary.UPLOAD_SUCCESS_TXT, false)
	}

	@When("Data provider chooses to see the details of the upload")
	def dp_view_upload_happy_path() {
		//click on the "Uploads" ribbon button
		Utils.click(Utils.getTestObjectById(Constant.Navigation.TAB_UPLOADS_ID))
		//find the name of the upload and click it
		Utils.click(Utils.getTestObjectByText(G_DATESETNAME, null))
		Utils.click(Utils.getTestObjectByText(Constant.Navigation.UPLOAD_DETAILS_BUTTON_TEXT, 'span'), 1)
	}

	@Then("Data provider should see information on the characteristics of the data upload")
	def dp_see_upload_info() {
		//wait for fields to be present
		WebUI.waitForElementPresent(Utils.getTestObjectByName(Constant.UploadFormFields.ORGANIZATION_NAME), Constant.DEFAULT_TIMEOUT)		
		//check that all field values are present
		WebUI.comment('waiting 2 sec')
		WebUI.delay(2)
		WebUI.comment('ready to verify upload field values are present')
		//WebUI.verifyTextPresent(Constant.UploadFormFields.ORGANIZATION_VALUE, false)
		//WebUI.verifyTextPresent(G_DATESETNAME, false)
		WebUI.verifyTextPresent(Constant.UploadFormFields.DESCRIPTION_VALUE, false)
		//WebUI.verifyTextPresent(Constant.UploadFormFields.NUMFILES_VALUE, false)
		//WebUI.verifyTextPresent((new SimpleDateFormat("yyyy-MMM-dd").parse(Constant.UploadFormFields.DATERANGESTART_VALUE)).format("yyyy-MM-dd'T'HH:mm:ss"), false)
		//WebUI.verifyTextPresent(Constant.UploadFormFields.DATERANGESTART_VALUE, false)
		//WebUI.verifyTextPresent((new SimpleDateFormat("yyyy-MMM-dd").parse(Constant.UploadFormFields.DATERANGEEND_VALUE)).format("yyyy-MM-dd'T'HH:mm:ss"), false)
		//WebUI.verifyTextPresent(Constant.UploadFormFields.DATERANGEEND_VALUE, false)
		WebUI.verifyTextPresent(Constant.UploadFormFields.LINKINGINSTRUCTIONS_VALUE, false)
		WebUI.verifyTextPresent(Constant.UploadFormFields.SENSITIVEFIELDS_VALUE, false)
		WebUI.verifyTextPresent(Constant.UploadFormFields.INCLUSIONS_VALUE, false)
		WebUI.verifyTextPresent(Constant.UploadFormFields.EXCLUSIONS_VALUE, false)
		WebUI.verifyTextPresent(Constant.UploadFormFields.QUALITYINFO_VALUE, false)
		WebUI.verifyTextPresent(Constant.UploadFormFields.DATACHANGESOVERTIME_VALUE, false)
		WebUI.verifyTextPresent(Constant.UploadFormFields.IMPORTANTINFO_VALUE, false)
		WebUI.verifyTextPresent(Constant.UploadFormFields.REFERENCES_VALUE, false)
		//WebUI.verifyTextPresent(Constant.UploadFormFields.DATECREATED_VALUE, false)
		//WebUI.verifyTextPresent((new SimpleDateFormat("yyyy-MMM-dd").parse(Constant.UploadFormFields.DATECREATED_VALUE)).format("yyyy-MM-dd'T'HH:mm:ss"), false)
		WebUI.verifyTextPresent(Constant.UploadFormFields.KEYWORDS_VALUE, false)
		//WebUI.verifyTextPresent(Constant.UploadFormFields.HYPERLINK_VALUE, false)
		
		//File level text to verify
		WebUI.verifyTextPresent(Constant.UploadFileMetadata.TITLE_VALUE, false)
		WebUI.verifyTextPresent((new SimpleDateFormat("yyyy-MM-dd").parse(Constant.UploadFileMetadata.STARTDATE_VALUE)).format("MMMMM d,yyyy"), false)
		WebUI.verifyTextPresent((new SimpleDateFormat("yyyy-MM-dd").parse(Constant.UploadFileMetadata.ENDDATE_VALUE)).format("MMMMM d,yyyy"), false)		
		WebUI.closeBrowser()
	}
}