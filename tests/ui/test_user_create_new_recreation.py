import json
import time
import datetime
import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from login import user_login


# Scenario:
# As a user, I want to create a new recreation.

# 1. Go to https://warm-river-49749.herokuapp.com/
# 2. Click on 'Login' on the menu
# 3. Enter username and password. click on 'Login'
# 4. Click on Recreations -> Create New
# 5. Type Title name, location
# 6. Click on 'Add recreation'
# 7. Go to Recreations -> only mine
# 8. Find created recreation

# Expected result: Recreation was added.

def get_base_url(env_name: str) -> str:
    data = None

    with open("env.json") as json_data_file:
        data = json.load(json_data_file)

    res = data["link"][env_name]
    return res


class UserCanCreateNewRecreatinTestCase(unittest.TestCase):

    def setUp(self):

        data = None

        with open("config.json") as json_data_file:
            data = json.load(json_data_file)

        self.creds = data['creds']
        self.browser = webdriver.Chrome()
        self.addCleanup(self.browser.quit)
        self.baseurl = get_base_url("prod")

    def testUserCreateNewRecreation(self):
        self.browser.get(self.baseurl)
        user_login(creds=self.creds, browser=self.browser)

        # Recreations -> Create New Recreation
        recreations_dropdown = self.browser.find_element_by_xpath(
            "//a[@id='hikeDropdown']")
        recreations_dropdown.click()
        time.sleep(2)

        create_new = self.browser.find_element_by_xpath(
            "//a[@href='/hikes/new']")
        create_new.click()
        time.sleep(2)

        # Create a unique name
        ct = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        recreation_name = 'Snohomish ' + ct
        title_box = self.browser.find_element_by_xpath(
            "//input[@id='title']")
        title_box.send_keys(recreation_name)
        time.sleep(5)

        search_box = self.browser.find_element_by_xpath(
            "//input[@class='mapboxgl-ctrl-geocoder--input form-control map-border-custom']")
        search_box.send_keys('Snohomish, Washington, United States')
        time.sleep(5)

        select_location_from_list = self.browser.find_element_by_xpath(
            "//ul[@class='suggestions']/li[1]")
        select_location_from_list.click()
        time.sleep(5)

        # Scroll a web page using selenium webdriver in python
        html = self.browser.find_element_by_tag_name('html')
        html.send_keys(Keys.END)
        time.sleep(2)

        add_recreation_button = self.browser.find_element_by_xpath(
            "//button[@class='btn btn-success btn-primary-custom']")
        add_recreation_button.click()
        time.sleep(5)

        # Check that recreation was added
        recreations_dropdown = self.browser.find_element_by_xpath(
            "//a[@id='hikeDropdown']")
        recreations_dropdown.click()
        time.sleep(2)

        only_mine = self.browser.find_element_by_xpath(
            "//a[@href='/hikes?mine=true']")
        only_mine.click()
        time.sleep(5)

        html = self.browser.find_element_by_tag_name('html')
        html.send_keys(Keys.END)
        time.sleep(2)

        self.browser.find_element_by_xpath(
            "//h5[contains(text(), '{0}')]".format(recreation_name))

    def tearDown(self):
        self.browser.quit()


if __name__ == '__main__':
    unittest.main(verbosity=2)
