#!/bin/bash

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "npm could not be found, please install Node.js and npm"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "node could not be found, please install Node.js and npm"
    exit 1
fi

if ! command -v tsc &> /dev/null; then
    echo "tsc could not be found, please install tsc (TypeScript CLI & compiler)"
    exit 1
fi

NODE_VERSION="$(node --version)"
NPM_VERSION="$(npm --version)"
TSC_VERSION="$(tsc -v)"

echo "Node version: $NODE_VERSION"
echo "npm version: $NPM_VERSION"
echo "tsc version: $TSC_VERSION"

# Install npm dependencies
npm install

npx tsc

# Setup .env file
node ./dist/index.js configure

# Get the directory where the install script is located
CMDH_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Alias command using the dynamically determined path
alias_cmd="alias cmdh='node $CMDH_DIR/dist/index.js'"

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
    echo "Alias added to .bashrc."
elif [ -n "$ZSH_VERSION" ]; then
    # Zsh shell
    add_alias_and_reload "${HOME}/.zshrc"
    echo "Alias added to .zshrc."
elif [ -n "$FISH_VERSION" ]; then
    # Fish shell
    echo "set -Ux cmdh 'node $CMDH_DIR/dist/index.js'" | fish
    echo "Alias added to Fish universal variables."
else
    echo "Unsupported shell. Please add the alias manually to your shell initializer."
    echo "$alias_cmd"
    exit 1
fi

echo "Installation complete!"
echo "Reload your shell config file or open a new terminal session to run cmdh."
