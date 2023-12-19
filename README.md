# cmdh - Create Linux commands from natural language

cmdh (short for Command Helper) is a tool that invokes LLM models provided by ollama or ChatGPT to convert a command query into a desired command.

It can work on commands ranging from simple ones where you may not know the command, all the way up to complex commands with chaining.

Now with [ollama](https://ollama.ai/) support!

[cmdh_demonstration_video.webm](https://user-images.githubusercontent.com/119892/233747166-552339ef-f3fe-4eb5-9161-db574b6f96fc.webm)

## Installation & Setup

```
git clone https://github.com/pgibler/cmdh.git
cd cmdh
./cmdh.sh configure
./cmdh.sh "Replace the word llm with llama in 'documentation.md' and output it to 'new.md'"
```

If you would like to make it available in your `PATH`, you can run `./install.sh` from the cmdh folder to update your `.bashrc` or `.zshrc`. The bash script will detect which one to update automatically.

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

## Features

- Build Linux commands from natural language
- Hotkey menu system for efficient usage
- Interactively run the generated commands
- Differentiates between shell command types: interactive and non-interactive
- Use either ollama for local execution or OpenAI models to use the gpt models remotely.

## LLM support

### ChatGPT

To configure cmdh to use ChatGPT, set your `OPENAI_API_KEY` using `cmdh configure` and set the `MODEL_NAME` to `gpt-3.5` or `gpt-4`.

### ollama

To configure cmdh to use ollama, you must have an ollama server running locally with a model installed. You can install ollama and Mistral on Linux using the following commands:

```
curl https://ollama.ai/install.sh | sh
ollama run mistral
```

Once the server is running, make sure the base URL of the ollama server matches what you have configured. By default, the URL is `http://localhost:11434`.

## Roadmap

The issues tracker contains possible improvements to the tool. There are some cool ideas that could be added to this to make it way more functional too. I will add them to the tracker as I think of them. I'm open to PRs with good ideas in them as well.
