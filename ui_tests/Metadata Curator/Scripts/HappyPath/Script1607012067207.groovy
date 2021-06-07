import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import static com.kms.katalon.core.testobject.ObjectRepository.findWindowsObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import com.kms.katalon.core.cucumber.keyword.CucumberBuiltinKeywords as CucumberKW
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testng.keyword.TestNGBuiltinKeywords as TestNGKW
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.windows.keyword.WindowsBuiltinKeywords as Windows
import internal.GlobalVariable as GlobalVariable
import org.openqa.selenium.Keys as Keys

WebUI.openBrowser('')

WebUI.navigateToUrl('https://auth.bgddi.com/auth/realms/dev/protocol/openid-connect/auth?response_type=code&client_id=outputchecker&redirect_uri=https%3A%2F%2Fmc-dev.bgddi.com%2Fapi%2Fcallback&scope=openid%20openid%20profile%20offline_access&state=J5WyZhXlY58zSp6G3of86RLm')

WebUI.setText(findTestObject('Object Repository/Page_Log in to dev/input_Username or email_username'), 'letti')

WebUI.setEncryptedText(findTestObject('Object Repository/Page_Log in to dev/input_Password_password'), '8tZfhh+poh8Zg96Y89yFzg==')

WebUI.click(findTestObject('Object Repository/Page_Log in to dev/input_Password_login'))

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Home/a_New Upload'))

WebUI.setText(findTestObject('Object Repository/Page_Metadata Curator - Upload/input_Ministry  Organization_dataministryOr_bba3f7'), 
    'm')

WebUI.setText(findTestObject('Object Repository/Page_Metadata Curator - Upload/input_Human friendly name_datadatasetName'), 
    'h')

WebUI.setText(findTestObject('Object Repository/Page_Metadata Curator - Upload/textarea_Description_datauploadDescription'), 
    'd')

WebUI.setText(findTestObject('Object Repository/Page_Metadata Curator - Upload/input_Number of files to be uploaded_datanu_fcc63c'), 
    '1')

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Upload/span_2'))

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Upload/span_Date Range End_input-group-text'))

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Upload/span_3'))

WebUI.doubleClick(findTestObject('Object Repository/Page_Metadata Curator - Upload/input_Source System_datasourceSystem'))

WebUI.setText(findTestObject('Object Repository/Page_Metadata Curator - Upload/input_Source System_datasourceSystem'), 's')

WebUI.setText(findTestObject('Object Repository/Page_Metadata Curator - Upload/textarea_Specific Instructions for appendin_31a1aa'), 
    's')

WebUI.setText(findTestObject('Object Repository/Page_Metadata Curator - Upload/textarea_Sensitive fields_datasensitiveFields'), 
    's')

WebUI.setText(findTestObject('Object Repository/Page_Metadata Curator - Upload/textarea_Inclusions_datainclusions'), 'i')

WebUI.setText(findTestObject('Object Repository/Page_Metadata Curator - Upload/textarea_Exclusions_dataexclusions'), 'e')

WebUI.setText(findTestObject('Object Repository/Page_Metadata Curator - Upload/textarea_Quality  Accurancy of Information__302075'), 
    'q')

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Upload/label_Data changes over time'))

WebUI.setText(findTestObject('Object Repository/Page_Metadata Curator - Upload/textarea_Data changes over time_datadataCha_4660b6'), 
    'd')

WebUI.setText(findTestObject('Object Repository/Page_Metadata Curator - Upload/textarea_Important Additional Information_d_9db258'), 
    'i')

WebUI.setText(findTestObject('Object Repository/Page_Metadata Curator - Upload/textarea_References  Research that uses dat_16d6b5'), 
    'r')

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Upload/input_Date data was created or updated_form_373934'))

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Upload/span_3'))

WebUI.setText(findTestObject('Object Repository/Page_Metadata Curator - Upload/textarea_Keywords describing data_datakeywo_a137e1'), 
    'test')

WebUI.setText(findTestObject('Object Repository/Page_Metadata Curator - Upload/input_Hyperlink to more information_datamor_345e47'), 
    'h')

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Upload/span_Next'))

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Upload/button_Next_v-icon notranslate v-icon--link_c6c479'))

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Upload/span_Next'))

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Upload/input_Date Range Start_input-195'))

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Upload/div_1'))

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Upload/input_Date Range End_input-200'))

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Upload/div_4'))

WebUI.setText(findTestObject('Object Repository/Page_Metadata Curator - Upload/textarea_File_input-204'), 'test')

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Upload/span_Next'))

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Upload/button_Upload'))

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Upload/a_Home'))

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Home/div_h Created on Dec 3, 2020 by me'))

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Data Upload Detail/span_Upload  File Info'))

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Home/div_h'))

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Data Upload Detail/span_Add Comment'))

WebUI.setText(findTestObject('Object Repository/Page_Metadata Curator - Data Upload Detail/textarea_Comment _comment'), 
    'test')

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Data Upload Detail/span_Save'))

WebUI.rightClick(findTestObject('Object Repository/Page_Metadata Curator - Data Upload Detail/div_test'))

WebUI.click(findTestObject('Object Repository/Page_Metadata Curator - Data Upload Detail/div_testUpdated on Dec 3, 2020 by lettiAdd Comment'))

