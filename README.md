# cmdh - A powerful and easy-to-use Linux command creator

cmdh (short for Command Helper) is a simple and powerful tool specifically to help users use Linux commands easily and effectively. It leverages the power of ChatGPT to help you find and run Linux commands with ease. Just provide a short description of the task you want to accomplish, and cmdh will generate the appropriate commands for you.

[cmdh_demonstration_video.webm](https://user-images.githubusercontent.com/119892/233747166-552339ef-f3fe-4eb5-9161-db574b6f96fc.webm)

## Description

This project is a Node.js command-line application that takes a user prompt describing a desired action or command and uses ChatGPT to generate a list of relevant Linux commands. The application will then offer options to run the generated commands, store them in a file, or discard them.

## Features

- Find relevant Linux commands by providing a simple description
- Interactively run the generated commands
- Leverage the power of ChatGPT to discover new commands and improve your Linux skills

## Installation

1. Clone the repository:

    `git clone https://github.com/pgibler/cmdh.git`

2. Navigate to the project directory:

    `cd cmdh`

3. Set up the environment variables required for the ChatGPT API (you'll need to obtain an API key):

    `echo "OPENAI_API_KEY=yourapikey" > .env`

## Usage

To use Linux Command Helper, simply provide a description of the task or command you want to accomplish as a command-line argument. Here are some examples:

```
cmdh 'Show system info.'
cmdh 'Display CPU speed.'
cmdh 'Monitor GPU temperature'
cmdh 'Continously monitor all in-use socket connections.'
```
