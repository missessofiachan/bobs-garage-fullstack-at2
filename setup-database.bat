@echo off
echo Setting up Bob's Garage Database...
echo.

REM Check if MySQL is installed
where mysql >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: MySQL is not installed or not in PATH.
    echo Please install MySQL first from: https://dev.mysql.com/downloads/installer/
    echo Or use XAMPP: https://www.apachefriends.org/download.html
    pause
    exit /b 1
)

echo MySQL found. Proceeding with database setup...
echo.

REM Install Sequelize CLI if not already installed
echo Installing Sequelize CLI...
npm install -g sequelize-cli
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install Sequelize CLI
    pause
    exit /b 1
)

cd server

REM Create database
echo Creating database 'bobs_garage'...
mysql -u root -ppassword -e "CREATE DATABASE IF NOT EXISTS bobs_garage CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to create database. Please check your MySQL credentials.
    echo Make sure MySQL service is running and the password is correct.
    pause
    exit /b 1
)

REM Run migrations
echo Running database migrations...
npx sequelize-cli db:migrate
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to run migrations
    pause
    exit /b 1
)

REM Run seeders
echo Running database seeders...
npx sequelize-cli db:seed:all
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to run seeders
    pause
    exit /b 1
)

echo.
echo Database setup completed successfully!
echo You can now start the server with: npm run dev
echo.
pause

