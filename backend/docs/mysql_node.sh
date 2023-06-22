#!/bin/bash

sudo apt-get update && sudo apt-get upgrade -y

# Install dependencies
sudo apt update
sudo apt install mariadb-server -y

# Set up root user with password
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('root');"
sudo mysql -e "FLUSH PRIVILEGES;"

echo "MariaDB installation and root user setup completed!"

# Install Node.js v18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Activate project.
cd ~/Desktop/backend
npm i

echo "MySQL and Node.js v18 installed. 'root' user created with password 'root'. Cloned Git repository to desktop and started Node.js application."