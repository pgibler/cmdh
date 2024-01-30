# cmdh - Generate Linux commands using an LLM

cmdh (short for Command Helper) is a tool that invokes LLM models provided by ollama or OpenAI to convert a command request into a desired command.

Use it to look up commands and flags that that you don't know offhand or generate complex commands with chaining.

[cmdh_demonstration_video.webm](https://user-images.githubusercontent.com/119892/233747166-552339ef-f3fe-4eb5-9161-db574b6f96fc.webm)

## Features

- Generate Linux commands from natural language
- Interactively run the generated command
- Hotkey menu system for efficient usage
- Differentiates between shell command types: interactive and non-interactive
- Supports [ChatGPT](https://platform.openai.com/docs/overview), [ollama](https://ollama.ai/), and [text-generation-webui](https://github.com/oobabooga/text-generation-webui)

## Prerequisites

- NodeJS - [installation guide](https://nodejs.org/en/download/package-manager)
- npm - [installation guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- tsc - [installation guide](https://www.npmjs.com/package/typescript)

## Installation

1. Set up and configure cmdh using the following command:
```
git clone https://github.com/pgibler/cmdh.git && cd cmdh && ./install.sh
```
2. Run it like so:
```
cmdh 'Output the number of lines of code committed to git last month'
```
3. Interact with the result interface to run the setup commands, desired command, all of the commands, or quit.

**NOTE**: You will have to reload your .bashrc / .zshrc / etc. or open a new terminal to make the cmdh command available in the shell. In Debian / Ubuntu, this is done by running `source ~/.bashrc`.

## Configuring

Before running cmdh, you will need to configure an LLM host and set configuration options required of that host.

- Run `cmdh configure` to start the configuration wizard. You will be asked to select an LLM host and input settings required by that host.
- Run `cmdh configure show` to display your current configuration.

### OpenAI

1. Generate an OpenAI key [here](https://platform.openai.com/api-keys).
2. Run `cmdh configure` and select the OpenAI option.
3. Select a model & input your OpenAI key.

### ollama

1. Install & run the ollama service & pull the dolphin-mistral model using the following commands:
```
curl https://ollama.ai/install.sh | sh
ollama pull dolphin-mistral
```
2. Run `cmdh configure`, select the ollama option, and set 'dolphin-mistral' as the model.

The default ollama service URL is `http://localhost:11434`. When you run `cmdh configure` and select ollama, you will see this value is configurable, but you can leave it as-is if you do not change the ollama host URL.

### text-generation-webui

1. Clone the repo: `git clone https://github.com/oobabooga/text-generation-webui`
2. Navigate to the cloned text-generation-webui folder and start the server by running `./start_linux --api --listen`.
3. Open the web UI for text-generation-webui (http://localhost:7860), open the "Model" tab, and in the "Download model or LoRA" form, input `Trelis/Llama-2-7b-chat-hf-function-calling-v2` and press "Download".
4. Select `llama-2-7b-function-calling.Q3_K_M.gguf` from the Model dropdown menu under the Model tab and click "Load".
2. Run `cmdh configure` and choose the 'text-generation-webui' option.

cmdh will automatically use whichever model is loaded by text-generation-webui.

HuggingFace model URL: [https://huggingface.co/Trelis/Llama-2-7b-chat-hf-function-calling-v2](https://huggingface.co/Trelis/Llama-2-7b-chat-hf-function-calling-v2)

## Roadmap

The issue tracker is mostly feature requests I have put in so I don't forget them. If you have any bug reports or good ideas, please include them in the tracker.

## Issues

If you run into any issues installing or running cmdh, please open a ticket in the project tracker. Include a detailed bug report with stacktraces and inputs and the mode of operation (OpenAI or ollama).
