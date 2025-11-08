#!/bin/bash

echo "Setting up Bob's Garage Database..."
echo

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "ERROR: MySQL is not installed or not in PATH."
    echo "Please install MySQL first."
    echo "On Ubuntu/Debian: sudo apt update && sudo apt install mysql-server"
    echo "On macOS: brew install mysql"
    echo "On Windows: Download from https://dev.mysql.com/downloads/installer/"
    exit 1
fi

echo "MySQL found. Proceeding with database setup..."
echo

# Install Sequelize CLI if not already installed
echo "Installing Sequelize CLI..."
npm install -g sequelize-cli
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Sequelize CLI"
    exit 1
fi

cd server

# Create database
echo "Creating database 'bobs_garage'..."
mysql -u root -ppassword -e "CREATE DATABASE IF NOT EXISTS bobs_garage CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create database. Please check your MySQL credentials."
    echo "Make sure MySQL service is running and the password is correct."
    echo "You may need to run: sudo systemctl start mysql (Linux)"
    echo "Or start MySQL from Services (Windows)"
    exit 1
fi

# Run migrations
echo "Running database migrations..."
npx sequelize-cli db:migrate
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to run migrations"
    exit 1
fi

# Run seeders
echo "Running database seeders..."
npx sequelize-cli db:seed:all
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to run seeders"
    exit 1
fi

echo
echo "Database setup completed successfully!"
echo "You can now start the server with: npm run dev"
echo

