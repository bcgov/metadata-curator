package test.mc.common
import com.kms.katalon.core.testobject.ConditionType
import com.kms.katalon.core.testobject.TestObject
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

/**
 * MC Helper and Utility functions for Katalon
 * @author Paul Ripley
 */
public class Utils {
	/**
	 * Returns a pseudo-random string for request names
	 * @return A string in the format "auto_gen_<current date-time>"
	 */
	static def generateDateSetNameDate() {
		return 'auto_gen_'.concat(new Date().format('MMddyy-hhmmss'))
	}

	/**
	 * Waits for a button to be click-able, visible, and not disabled
	 */
	static def waitClickable(TestObject t) {
		WebUI.waitForElementVisible(t, Constant.DEFAULT_TIMEOUT)
		WebUI.waitForElementNotHasAttribute(t, "disabled", Constant.DEFAULT_TIMEOUT)
		WebUI.waitForElementClickable(t, Constant.DEFAULT_TIMEOUT)
	}
	
	/**
	* Clicks (usually a button or link)
	* @param delay optional parameter that allows for a hard delay of x seconds
	*/
	static def click(TestObject t, int delay=0) {
		waitClickable(t)
		if (delay > 0) { WebUI.delay(delay) }
		WebUI.click(t)
	}
	
	/**
	 * Waits for TestObject to be available then sets its text
	 * @param delay optional parameter that allows for a hard delay of x seconds
	 */
	 static def setText(TestObject t, String value, int delay=0) {
		 waitClickable(t)
		 if (delay > 0) { WebUI.delay(delay) }
		 WebUI.setText(t, value)
	 }

	/**
	 * Returns the TestObject correlating to the id
	 * @param id The id of the element to filter on
	 * @return TestObject
	 */
	static def getTestObjectById(String id) {
		TestObject tObject = new TestObject(id)
		tObject.addProperty('id', ConditionType.EQUALS, id, true)
		return tObject
	}

	/**
	 * Returns the TestObject correlating to a web element that has an id which contains idPart
	 * @param id The id of the element to filter on
	 * @return TestObject
	 */
	static def getTestObjectByIdPart(String idPart, String tag = 'input') {
		TestObject tObject = new TestObject(idPart)
		tObject.addProperty('id', ConditionType.CONTAINS, idPart, true)
		if(tag) tObject.addProperty('tag', ConditionType.EQUALS, tag, true)
		return tObject
	}

	/**
	 * Returns the TestObject correlating to the text
	 * @param text The text string to filter on
	 * @param tag The optional html tag element to filter on.
	 * Defaults to the 'a' tag. Set as null to make a more generic search
	 * @return TestObject
	 */
	// TODO: Consider inverting tag default to null instead of a
	static def getTestObjectByText(String text, String tag = 'a') {
		TestObject tObject = new TestObject(text)
		tObject.addProperty('text', ConditionType.EQUALS, text, true)
		if(tag) tObject.addProperty('tag', ConditionType.EQUALS, tag, true)
		return tObject
	}

	/**
	 * Returns the TestObject correlating to the class
	 * @param cls The class attribute to filter on
	 * @return TestObject
	 */
	static def getTestObjectByClass(String cls) {
		TestObject tObject = new TestObject(cls)
		tObject.addProperty('class', ConditionType.EQUALS, cls, true)
		return tObject
	}

	/**
	 * Returns the TestObject correlating to a web element that has a multiple classes which contains specified class
	 * @param cls The class of the element to filter on
	 * @return TestObject
	 */
	static def getTestObjectByContainsClass(String cls) {
		TestObject tObject = new TestObject(cls)
		tObject.addProperty('class', ConditionType.CONTAINS, cls, true)
		return tObject
	}

	/**
	 * Returns the TestObject correlating to the given xpath
	 * @param path The xpath string to filter on
	 * @return TestObject
	 */
	static def getTestObjectByXPath(String path) {
		TestObject tObject = new TestObject(path)
		tObject.addProperty('xpath', ConditionType.EQUALS, path, true)
		return tObject
	}

	/**
	 * Returns the TestObject correlating to the name
	 * @param nm The name attribute to filter on
	 * @return TestObject
	 */
	static def getTestObjectByName(String nm) {
		TestObject tObject = new TestObject(nm)
		tObject.addProperty('name', ConditionType.EQUALS, nm, true)
		return tObject
	}
	/**
	 * Returns the TestObject correlating to the tag
	 * @param tag The tag attribute to filter on
	 * @return TestObject
	 */
	static def getTestObjectByType(String ty = 'submit', String tag = 'input') {
		TestObject tObject = new TestObject(ty)
		tObject.addProperty('type', ConditionType.EQUALS, ty, true)
		//tObject.addProperty('tag', ConditionType.EQUALS, tag, true)
		return tObject
	}
}
