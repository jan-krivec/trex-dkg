@echo off
setlocal enabledelayedexpansion

REM Define the path to OT Node and number of nodes
set pathToOtNode=%cd%
set numberOfNodes=8
set network=hardhat1:31337
set tripleStore=ot-blazegraph

REM Define available networks
set availableNetworks=hardhat1:31337

REM Load environment variables from .env file
for /f "tokens=1,2 delims==" %%a in (%pathToOtNode%\.env) do (
    set %%a=%%b
)

set ACCESS_KEY=%RPC_ENDPOINT%

REM Process script arguments
:parse_args
if "%~1"=="" goto :done_args
if "%~1"=="--nodes" (
    set /a numberOfNodes=%2
    shift
    shift
    goto :parse_args
)
if "%~1"=="--network" (
    set network=%2
    shift
    shift
    goto :parse_args
)
if "%~1"=="--tripleStore" (
    set tripleStore=%2
    shift
    shift
    goto :parse_args
)
echo Invalid argument: %~1
exit /b 1
:done_args

REM Check if the network is valid
if not "%network%"=="hardhat1:31337" (
    echo Invalid network parameter. Available networks: hardhat
    exit /b 1
)

REM Start hardhat1 if network is hardhat1:31337
if "%network%"=="hardhat1:31337" (
    echo ================================
    echo ====== Starting hardhat1 =======
    echo ================================
    start cmd /k "cd /d %pathToOtNode% && node tools/local-network-setup/run-local-blockchain.js 8545 :v1"
    echo Waiting for hardhat to start and contracts deployment

    echo ================================
    echo ====== Starting hardhat2 =======
    echo ================================
    start cmd /k "cd /d %pathToOtNode% && node tools/local-network-setup/run-local-blockchain.js 9545 :v1"
    echo Waiting for hardhat to start and contracts deployment
)

REM Generate configuration files
echo ================================
echo ====== Generating configs ======
echo ================================
start cmd /k "cd /d %pathToOtNode% && node tools/local-network-setup/generate-config-files.js %numberOfNodes% %network% %tripleStore% %hubContractAddress%"

REM Start nodes
echo ================================
echo ======== Starting nodes ========
echo ================================
set i=0
:loop
if !i! geq %numberOfNodes% goto :done_nodes
echo Starting node !i!
start cmd /k "cd /d %pathToOtNode% && node index.js ./tools/local-network-setup/.node!i!_origintrail_noderc.json"
set /a i=!i!+1
goto :loop
:done_nodes

REM Keep the script open after nodes start
pause
