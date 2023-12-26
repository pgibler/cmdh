sudo apt update
sudo apt install nodejs
sudo apt install npm

node -v
npm -v

#!/bin/bash

# Check if npm is available
if ! command -v npm &> /dev/null
then
    echo "npm could not be found, please install Node.js and npm"
    exit 1
fi

# Proceed with npm install
npm install

# Ask user to run update_path.sh
read -p "Do you want to update the PATH variable? (yes/no): " choice
if [ "$choice" = "yes" ]; then
    ./update_path.sh
fi
