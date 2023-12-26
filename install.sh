#!/bin/bash

# Function to install Node.js, npm, and xsel for clipboardy support.
install_node_ubuntu() {
    echo "Running updates..."
    sudo apt update
    echo "Installing Node.js and npm..."
    sudo apt install nodejs npm xsel -y
    echo "Node.js and npm have been installed."
}

# Function to install Node.js and npm for Arch Linux
install_node_arch() {
    echo "Installing Node.js and npm..."
    sudo pacman -Sy nodejs npm xsel
    echo "Node.js and npm have been installed."
}

# Function to install Node.js and npm for Red Hat-based systems
install_node_redhat() {
    echo "Installing Node.js and npm..."
    sudo yum install nodejs npm xsel -y
    echo "Node.js and npm have been installed."
}

# Detect the package manager and install Node.js
if command -v apt > /dev/null; then
    install_node_ubuntu
elif command -v pacman > /dev/null; then
    install_node_arch
elif command -v yum > /dev/null; then
    install_node_redhat
else
    echo "Unsupported package manager or Linux distribution."
    exit 1
fi

node -v
npm --version

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "npm could not be found, please install Node.js and npm"
    exit 1
fi

# Install npm dependencies
npm install

# Setup .env file
node ./src/run.mjs configure

echo 'Creating symlink to /usr/local/bin/cmdh...'

# Get the directory where the install script is located
CMDH_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Create a run.sh script
echo "#!/bin/bash" > "$CMDH_DIR/run.sh"
echo "node $CMDH_DIR/src/run.mjs \"\$@\"" >> "$CMDH_DIR/run.sh"
chmod +x "$CMDH_DIR/run.sh"

# Create a symlink to the run.sh script in /usr/local/bin
sudo ln -sf "$CMDH_DIR/run.sh" /usr/local/bin/cmdh

echo "Installation complete! You can now use the 'cmdh' command."
