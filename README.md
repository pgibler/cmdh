# cmdh - Generate Linux commands using an LLM

cmdh (short for Command Helper) is a tool that invokes LLM models provided by ollama or ChatGPT to convert a command request into a desired command.

It can work on commands ranging from simple ones where you may not know the command, all the way up to complex commands with chaining.

Now with [ollama](https://ollama.ai/) support!

[cmdh_demonstration_video.webm](https://user-images.githubusercontent.com/119892/233747166-552339ef-f3fe-4eb5-9161-db574b6f96fc.webm)

## Prerequisites

- NodeJS
- npm

## Installation

Set up and configure the project by running these commands:

```
git clone https://github.com/pgibler/cmdh.git && cd cmdh && ./install.sh
```

Then you can run it like so:

```
cmdh "Replace the word llm with llama in documentation.md and output it to new.md"
```

NOTE: You will have to reload your .bashrc / .zshrc / etc. or open a new terminal to enable the command.

### Distro support

Current supports Debian, Arch, and RHEL based systems for install.

If you have another system, you will need to install the packages manually. Check out `install.sh` in the cmdh folder for the logic on how to install it on other systems and adapt it to your own, or better yet, open a PR.

## Usage

To use it, you simply type something like:

`cmdh 'Output the number of lines of code committed to git last month'`

The output will look something like this:

```
✔ Retrieving command... Output the number of lines of code committed to git l...
setup commands: [ sudo apt-get update, sudo apt-get install git ]
desire command: git diff --stat `git rev-list -n 1 --before="1 month ago" master`
assistant message: This command will show you the number of lines of code that were committed to git last month. Please make sure you are in the correct directory where your git repository is located before running this command.
? Choose an option:
    Run all commands (a)
    Run setup commands (s)
>   Run desire command (d)
    Quit (q)
```

Then if you run the desire command, you'll see something like this:

```
? Choose an option: Run desire command (d)
Running: git log --since='1 month ago' --pretty=tformat: --numstat | gawk '{ add += $1 ; subs += $2 ; loc += $1 - $2 } END { printf "added lines: %s removed lines: %s total lines: %s\n",add,subs,loc }'
added lines: 63648 removed lines: 8315 total lines: 55333
```

## Features

- Build Linux commands from natural language
- Hotkey menu system for efficient usage
- Interactively run the generated commands
- Differentiates between shell command types: interactive and non-interactive
- Use either ollama for local execution or OpenAI models to use the gpt models remotely.

## LLM support

### ChatGPT

You must get an OpenAI access key to run cmdh using ChatGPT.

Supported models
- `gpt-3.5-turbo`
- `gpt-4`

### ollama

To configure cmdh to use ollama, you must have an ollama server running locally with a model installed. You can install ollama and Mistral on Linux using the following commands:

```
curl https://ollama.ai/install.sh | sh
ollama run mistral
```

Once the server is running, make sure the base URL of the ollama server matches what you have configured. By default, the URL is `http://localhost:11434` in both ollama and the .env file.

## Roadmap

The issue tracker is mostly feature requests I have put in so I don't forget them. If you have any bug reports or good ideas, please include them in the tracker.

## Issues

If you run into any issues installing or running cmdh, please open a ticket in the project tracker. Include a detailed bug report with stacktraces and inputs and the mode of operation (OpenAI or ollama).