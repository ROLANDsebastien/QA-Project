from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json
import time

# Connect to Selenium Grid
options = webdriver.ChromeOptions()
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
driver = webdriver.Remote(
    command_executor='http://selenium:4444/wd/hub',
    options=options
)

results = {'total': 1, 'passed': 0}

try:
    # Test 1: Load homepage
    driver.get('http://frontend:3000')
    WebDriverWait(driver, 10).until(EC.title_contains('FM Compta'))
    print("Homepage loaded successfully")
    results['passed'] = 1
except Exception as e:
    print(f"Test failed: {e}")

driver.quit()

# Save results
with open('/qa/dashboard/selenium_results.json', 'w') as f:
    json.dump(results, f)
