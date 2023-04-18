#!/bin/bash

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo "Node.js is not installed. Please install Node.js and try again."
  exit 1
fi

# Clone the repository
git clone https://github.com/pgibler/cmdh.git ~/cmdh

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

echo "Installation complete! You can now use the 'cmdh' command."
