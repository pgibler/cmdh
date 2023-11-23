# cmdh - Create Linux commands from natural language

cmdh (short for Command Helper) is a tool I made to first help myself learn Linux. It turns out to be pretty good at generating all sorts of commands, even highly specific and complex ones. It's saved me many hours already of searching through documentation everytime I need to do something in the terminal. I would eventually like to move the system to using LLaMa to make it fully open source. Until that happens, I'm releasing what I have as it's already been a productivity winner for me.

Roadmap: The issues tracker contains possible improvements to the tool. There are some cool ideas that could be added to this to make it way more functional too. I will add them to the tracker as I think of them. I'm open to PRs with good ideas in them as well.

## Usage

To use it, you simply type something like: `cmdh 'Output the number of lines of code committed to this git repo last month'` and it will output something like this:

```
✔ Retrieving command... Output the number of lines of code committed to this ...
setup commands: [ sudo apt-get update, sudo apt-get install git ]
desire command: git log --since='1 month ago' --pretty=tformat: --numstat | gawk '{ add += $1 ; subs += $2 ; loc += $1 - $2 } END { printf "added lines: %s removed lines: %s total lines: %s\n",add,subs,loc }'
assistant message: This command will show you the number of lines added and removed from your git repository over the past month. Please make sure to run this command from the root directory of your git repository.
? Choose an option:
    Run all commands (A)
    Run setup commands (S)
>   Run desire command (D)
    Quit (Q)
```

Then if you run the desire command, you'll see something like this:

```
? Choose an option: Run desire command (D)
Running: git log --since='1 month ago' --pretty=tformat: --numstat | gawk '{ add += $1 ; subs += $2 ; loc += $1 - $2 } END { printf "added lines: %s removed lines: %s total lines: %s\n",add,subs,loc }'
added lines: 63648 removed lines: 8315 total lines: 55333
```

[cmdh_demonstration_video.webm](https://user-images.githubusercontent.com/119892/233747166-552339ef-f3fe-4eb5-9161-db574b6f96fc.webm)

## Features

- Build Linux commands from natural language
- Hotkey menu system for efficient usage
- Interactively run the generated commands
- Differentiates between shell command types: interactive and non-interactive

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
