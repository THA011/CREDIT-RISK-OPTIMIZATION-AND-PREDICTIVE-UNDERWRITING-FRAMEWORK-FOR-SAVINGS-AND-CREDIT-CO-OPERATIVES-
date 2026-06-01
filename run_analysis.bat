@echo off
setlocal enabledelayedexpansion

:: ----------------------------------------------------------------------
:: MWATHA MAINA ANALYTICS SUITE - AUTOMATED PROCESSING GATEWAY
:: Path: F:\Projects\Python\Freelance.Analytics.Statistics_011\run_analysis.bat
:: ----------------------------------------------------------------------

echo =====================================================================
echo   CREDIT RISK ENGINE v1.2 ^| PIPELINE INITIALIZATION
echo =====================================================================
echo.

:: 1. DYNAMIC ENVIRONMENT NAVIGATION
:: Map directories relative to where this batch script sits physically to prevent hardcoded string breaks.
set "SCRIPT_DIR=%~dp0"
set "TARGET_DIR=%SCRIPT_DIR%data-analysis-with-python-an-spss-model"

if not exist "%TARGET_DIR%" (
    echo [ERROR] Target analysis directory cannot be resolved:
    echo         %TARGET_DIR%
    goto :CRITICAL_FAIL
)

:: Switch drive and directory in one atomic operation
cd /d "%TARGET_DIR%"

:: 2. RUNTIME DEPENDENCY CHECK
:: Verify Python availability on the environment path before launching matrix transformations
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python environment execution framework was not found on system PATH.
    goto :CRITICAL_FAIL
)

:: 3. PIPELINE EXECUTION WITH EXIT-CODE CAPTURE
echo [STATUS] Launching credit risk modeling calculations...
echo ---------------------------------------------------------------------
python credit_analytics_pipeline.py
set "PIPELINE_STATUS=%ERRORLEVEL%"
echo ---------------------------------------------------------------------

:: 4. EVALUATION LOGIC
if %PIPELINE_STATUS% neq 0 (
    echo [ERROR] Python execution sub-thread terminated with critical exit code: %PIPELINE_STATUS%
    goto :CRITICAL_FAIL
)

:: 5. OUTPUT VERIFICATION
:: Ensure the analytics script actually spat out the expected files before reporting success
echo [STATUS] Auditing generated analytical outputs...
set "MISSING_OUTPUTS=0"

if not exist "cleaned_credit_matrix.csv" (
    echo   [!] Warning: Expected data output "cleaned_credit_matrix.csv" is missing.
    set "MISSING_OUTPUTS=1"
)
if not exist "portfolio_risk_exposure.png" (
    echo   [!] Warning: Expected data visualization "portfolio_risk_exposure.png" is missing.
    set "MISSING_OUTPUTS=1"
)

if %MISSING_OUTPUTS% neq 0 goto :WARNED_SUCCESS

:: SUCCESS EXIT
echo.
echo =====================================================================
echo   PIPELINE SUCCESSFUL
echo   Verified Matrix Logs:
echo     - cleaned_credit_matrix.csv (Updated)
echo     - portfolio_risk_exposure.png (Rendered)
echo =====================================================================
goto :END

:WARNED_SUCCESS
echo.
echo =====================================================================
echo   [!] PIPELINE FINISHED WITH STRUCTURAL ANOMALIES
echo       Script ran completely but expected files were missing.
echo =====================================================================
goto :END

:CRITICAL_FAIL
echo.
echo =====================================================================
echo   [CRITICAL SYSTEM FAILURE] Execution halted prematurely.
echo   Check internal engine error logs above.
echo =====================================================================
color 0C
:: Brief pause to display the crimson red terminal error state if run via desktop click
timeout /t 2 >nul

:END
echo.
pause
:: Reset terminal color attributes upon exit closure
color