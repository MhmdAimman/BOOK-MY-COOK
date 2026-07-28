#!/bin/bash

# BOOKMYCOOK PostgreSQL Setup Script
# Run with: sudo bash setup_database.sh

set -e

echo "=== Installing PostgreSQL ==="
apt update
apt install -y postgresql postgresql-contrib

echo "=== Starting PostgreSQL ==="
systemctl start postgresql
systemctl enable postgresql

echo "=== Creating database and user ==="
sudo -u postgres psql -c "CREATE DATABASE bookmycook;"
DB_PASSWORD=${BOOKMYCOOK_DB_PASSWORD:-change-this-password}
sudo -u postgres psql -c "CREATE USER bookmycook_user WITH PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bookmycook TO bookmycook_user;"
sudo -u postgres psql -c "ALTER USER bookmycook_user CREATEDB;"

echo "=== Running schema ==="
sudo -u postgres psql -d bookmycook -f /home/mhmdaimman/BOOKMYCOOK/database/schema.sql
sudo -u postgres psql -d bookmycook -f /home/mhmdaimman/BOOKMYCOOK/database/seeds/tamilnadu_cities.sql

echo "=== PostgreSQL Setup Complete ==="
echo "Database: bookmycook"
echo "User: bookmycook_user"
echo "Password: set from BOOKMYCOOK_DB_PASSWORD or change-this-password"
