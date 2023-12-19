# cmdh - Create Linux commands from natural language

cmdh (short for Command Helper) is a tool the invokes LLM models provided by ollama or ChatGPT to convert a command query into a desired command.

It can work on commands ranging from simple ones where you may not know the command, all the way up to complex commands with chaining.

Now with [ollama](https://ollama.ai/) support!

[cmdh_demonstration_video.webm](https://user-images.githubusercontent.com/119892/233747166-552339ef-f3fe-4eb5-9161-db574b6f96fc.webm)

## Installation & Setup

```
git clone https://github.com/pgibler/cmdh.git
cd cmdh
cmdh configure
cmdh 'Display available hard drive space'
```

## Usage

To use it, you simply type something like:

`cmdh 'Output the number of lines of code committed to git last month'`

The output will look something like this:

```
✔ Retrieving command... Output number of commits in the past month in this gi...
desire command: git rev-list --count --since="1 month ago" HEAD
assistant message: This command will output the number of commits made in the past month in the current git project. Make sure you are in the root directory of your git project when running this command.
? Choose an option: Run desire command (D)
Running: git rev-list --count --since="1 month ago" HEAD
7
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
- Use either ollama for local execution or OpenAI models.

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
