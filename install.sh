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

# Get the directory where the install script is located
CMDH_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Alias command using the dynamically determined path
alias_cmd="alias cmdh='node $CMDH_DIR/src/run.mjs'"

# Function to add alias and reload config for Bash and Zsh
add_alias_and_reload() {
    shell_rc=$1
    echo "$alias_cmd" >> "$shell_rc"
    source "$shell_rc"
}

# Detect the shell and update the corresponding config file
if [ -n "$BASH_VERSION" ]; then
    # Bash shell
    add_alias_and_reload "${HOME}/.bashrc"
    echo "Alias added to .bashrc. Please open a new terminal session to use 'cmdh' command."
elif [ -n "$ZSH_VERSION" ]; then
    # Zsh shell
    add_alias_and_reload "${HOME}/.zshrc"
    echo "Alias added to .zshrc. Please open a new terminal session to use 'cmdh' command."
elif [ -n "$FISH_VERSION" ]; then
    # Fish shell
    echo "set -Ux cmdh 'node $CMDH_DIR/src/run.mjs'" | fish
    echo "Alias added to Fish universal variables. Please open a new terminal session to use 'cmdh' command."
else
    echo "Unsupported shell. Please add the alias manually to your shell initializer."
    echo "$alias_cmd"
    exit 1
fi

echo "Installation complete!"
echo "Reload your config file (source .bashrc, source .zshrc, etc.) or open a new terminal session to use 'cmdh' command."
