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

if ! command -v npx tsc &> /dev/null; then
    echo "tsc could not be found, please install tsc (TypeScript CLI & compiler)"
    exit 1
fi

NODE_VERSION="$(node --version)"
NPM_VERSION="$(npm --version)"
TSC_VERSION="$(npx tsc -v)"

echo "Node version: $NODE_VERSION"
echo "npm version: $NPM_VERSION"
echo "tsc version: $TSC_VERSION"

# Install npm dependencies
npm install

npx tsc

# Setup .env file
node ./dist/src/cmdh.js configure

# Get the directory where the install script is located
CMDH_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cmdh_cmd="node $CMDH_DIR/dist/src/cmdh.js"
user_shell="$(basename "${SHELL:-}")"
alias_added=0

# Alias command using the dynamically determined path
alias_cmd="alias cmdh='$cmdh_cmd'"

# Function to add alias and reload config for Bash and Zsh
add_alias_and_reload() {
    shell_rc=$1
    echo "$alias_cmd" >> "$shell_rc"
    source "$shell_rc"
}

# Detect the shell and update the corresponding config file
read -r -p "Update your shell source file to add a cmdh alias? [y/N] " update_shell_source
update_shell_source="${update_shell_source,,}"

if [ "$update_shell_source" = "y" ] || [ "$update_shell_source" = "yes" ]; then
    if [ "$user_shell" = "bash" ]; then
        # Bash shell
        add_alias_and_reload "${HOME}/.bashrc"
        echo "Alias added to .bashrc."
        if [ "$(uname -s)" = "Linux" ]; then
            echo "Linux reload command:"
            echo "source ~/.bashrc"
        fi
        alias_added=1
    elif [ "$user_shell" = "zsh" ]; then
        # Zsh shell
        add_alias_and_reload "${HOME}/.zshrc"
        echo "Alias added to .zshrc."
        alias_added=1
    elif [ "$user_shell" = "fish" ]; then
        # Fish shell
        echo "set -Ux cmdh '$cmdh_cmd'" | fish
        echo "Alias added to Fish universal variables."
        alias_added=1
    else
        echo "Unsupported shell. Please add the alias manually to your shell initializer."
        echo "$alias_cmd"
        exit 1
    fi
else
    echo "Leaving your shell source file unchanged."
    echo "Run cmdh directly without an alias using:"
    echo "$cmdh_cmd 'your prompt here'"
fi

echo "Installation complete!"
if [ "$alias_added" -eq 1 ]; then
    os_name="$(uname -s)"
    if [ "$os_name" = "Darwin" ]; then
        echo "macOS reload command:"
    elif [ "$os_name" = "Linux" ]; then
        if [ "$user_shell" != "bash" ]; then
            echo "Linux reload command:"
        fi
    elif [[ "$os_name" == MINGW* ]] || [[ "$os_name" == MSYS* ]] || [[ "$os_name" == CYGWIN* ]]; then
        echo "Windows (Git Bash/MSYS) reload command:"
    else
        echo "Reload command:"
    fi

    if [ "$user_shell" = "bash" ]; then
        if [ "$os_name" != "Linux" ]; then
            echo "source ~/.bashrc"
        fi
    elif [ "$user_shell" = "zsh" ]; then
        echo "source ~/.zshrc"
    elif [ "$user_shell" = "fish" ]; then
        echo "exec fish"
    else
        echo "Open a new terminal session."
    fi
fi
