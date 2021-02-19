import json
import time
import unittest
from selenium import webdriver
from typing import Dict


def user_login(creds: Dict[str, str], browser):

    click_on_login = browser.find_element_by_xpath(
        "//a[@href='/login']")
    click_on_login.click()
    time.sleep(2)

    username_box = browser.find_element_by_xpath(
        "//input[@id='username' and @name='username']")
    username_box.send_keys(creds['email'])
    time.sleep(2)

    pwd_box = browser.find_element_by_xpath(
        "//input[@id='password' and @name='password']")
    pwd_box.send_keys(creds['password'])
    time.sleep(2)

    login_button = browser.find_element_by_xpath(
        "//button[@class='btn btn-success shadow-none btn-primary-custom']")
    login_button.submit()
    time.sleep(5)
