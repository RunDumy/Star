@echo off
REM Script to set up and run Azure Load Tests for STAR backend
REM This script requires the Azure CLI

REM Parameters
set RESOURCE_GROUP=star-app-rg
set LOCATION=eastus
set LOAD_TEST_NAME=star-load-test
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "TEST_RUN_NAME=star-loadtest-run-%dt:~0,12%"
set TEST_PLAN_FILE=.\star-load-test-plan.jmx

REM Check dependencies
echo Checking dependencies...
where az >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Azure CLI is not installed. Please install it first.
    exit /b 1
)

REM Create Azure Load Testing resource if it doesn't exist
echo Checking if Azure Load Testing resource exists...
az load test show --name %LOAD_TEST_NAME% --resource-group %RESOURCE_GROUP% >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Creating Azure Load Testing resource...
    az load test create --name %LOAD_TEST_NAME% --resource-group %RESOURCE_GROUP% --location %LOCATION%
) else (
    echo Azure Load Testing resource already exists.
)

REM Upload test plan
echo Uploading JMX test plan...
for /f "delims=" %%i in ('az load test-file upload --load-test-resource %LOAD_TEST_NAME% --resource-group %RESOURCE_GROUP% --file-path %TEST_PLAN_FILE% --query testId -o tsv') do set TEST_ID=%%i
echo Test ID: %TEST_ID%

REM Create test
echo Creating test run...
az load test create --load-test-resource %LOAD_TEST_NAME% --resource-group %RESOURCE_GROUP% ^
  --test-id %TEST_ID% ^
  --display-name %TEST_RUN_NAME% ^
  --description "Load test for STAR backend on Azure" ^
  --engine-instances 1 ^
  --error-percentage 5 ^
  --avg-response-time 100

REM Start test
echo Starting load test run...
for /f "delims=" %%i in ('az load test-run start --load-test-resource %LOAD_TEST_NAME% --resource-group %RESOURCE_GROUP% --test-id %TEST_ID% --query testRunId -o tsv') do set RUN_ID=%%i

echo Test run started with ID: %RUN_ID%
echo You can monitor the test in the Azure portal.

REM Check test status every 30 seconds
echo Monitoring test run status...
:check_status
for /f "delims=" %%i in ('az load test-run show --load-test-resource %LOAD_TEST_NAME% --resource-group %RESOURCE_GROUP% --test-run-id %RUN_ID% --query status -o tsv') do set STATUS=%%i
echo Current status: %STATUS%

if "%STATUS%"=="DONE" goto :test_done
if "%STATUS%"=="FAILED" goto :test_done
if "%STATUS%"=="CANCELLED" goto :test_done

timeout /t 30 /nobreak >nul
goto :check_status

:test_done
REM Get test results
echo Test completed with status: %STATUS%
echo Downloading test results...
set RESULTS_FILE=%TEST_RUN_NAME%_results.zip
az load test-run download-files --load-test-resource %LOAD_TEST_NAME% --resource-group %RESOURCE_GROUP% --test-run-id %RUN_ID% --path .\ --name %RESULTS_FILE%

echo Test results downloaded to %RESULTS_FILE%

REM If the test failed, exit with error
if "%STATUS%"=="FAILED" (
    echo Load test failed!
    exit /b 1
)

echo Load test completed successfully!