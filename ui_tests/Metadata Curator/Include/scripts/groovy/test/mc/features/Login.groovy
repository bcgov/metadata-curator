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
/**
 * Metadata Curator Login steps for Katalon
 * @author Paul Ripley
 */
public class Login extends Step {
	
	def user_login(String user) {
		def username = ''
		def password = ''


		switch (user.toLowerCase()) {
			case 'data provider':
				username = GlobalVariable.DATA_PROVIDER_1_USERNAME
				password = GlobalVariable.DATA_PROVIDER_1_PWD
				break
			case 'data provider team member':
				username = GlobalVariable.DATA_PROVIDER_2_USERNAME
				password = GlobalVariable.DATA_PROVIDER_2_PWD
				break
			default:
				throw new Exception("User ${user} is not defined")
				break
		}

		login(username, password)
	}
	/*
	 @When("metadata approver logs in")
	 def metadata_approver_logs_in() {
	 login(GlobalVariable.MC_APPROVER_USERNAME, GlobalVariable.MC_APPROVER_PWD)
	 }
	 @When("data provider logs out")
	 def requester_logs_out() {
	 logout()
	 }
	 */
	/**
	 * Logs a user into the system with the specified parameters
	 * @param username String 
	 * @param password String (unencoded)
	 * @param url String of login page endpoint. Defaults to MC_URL global variable.
	 */
	def login(String username, String password, String url = GlobalVariable.MC_URL) {
		WebUI.openBrowser(null)
		WebUI.navigateToUrl(url)
		WebUI.waitForPageLoad(Constant.DEFAULT_TIMEOUT)
		TestObject kcLoginButton = Utils.getTestObjectById('kc-login')
		WebUI.setText(Utils.getTestObjectById('username'), username)
		WebUI.setText(Utils.getTestObjectById('password'), password)
		WebUI.waitForElementClickable(kcLoginButton, Constant.DEFAULT_TIMEOUT)
		WebUI.click(kcLoginButton)
//		WebUI.waitForPageLoad(Constant.DEFAULT_TIMEOUT)
//		if (username == "letti") {
//			TestObject t = Utils.getTestObjectByXPath("//form[@id='kc-project-login-form']/div/div/label")
//			WebUI.click(t)
//			kcLoginButton = Utils.getTestObjectById('kc-login')
//			WebUI.click(kcLoginButton)
//		}
	}

	/**
	 * Logs a user out of the system with the specified parameters
	 * @param url String of login page endpoint. Defaults to OCWA_URL global variable.
	 */
	def logout(String url = GlobalVariable.MC_URL) {
		WebUI.navigateToUrl("$url$Constant.Login.LOGOUT_URL")
		WebUI.waitForPageLoad(Constant.DEFAULT_TIMEOUT)
	}
}
