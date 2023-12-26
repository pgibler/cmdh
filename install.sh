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
read -p "Do you want to update the PATH variable? (Y/n): " choice
if [ "$choice" = "Y" -o "$choice" = "y" -o "$choice" = "yes" -o "$choice" = "" ]; then
    # Set up the alias in .bashrc or .zshrc
    if [ -n "$BASH_VERSION" ]; then
      echo "alias cmdh='node ~/cmdh/src/run.mjs'" >> ~/.bashrc
      source ~/.bashrc
    elif [ -n "$ZSH_VERSION" ]; then
      echo "alias cmdh='node ~/cmdh/src/run.mjs'" >> ~/.zshrc
      source ~/.zshrc
    else
      echo "Unsupported shell. Please add the alias manually."
      exit 1
    fi
fi

echo "Installation complete! You can now use the 'cmdh' command."
