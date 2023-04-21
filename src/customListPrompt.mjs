import {
  createPrompt,
  useState,
  useKeypress,
  usePrefix,
  isEnterKey,
  isUpKey,
  isDownKey,
} from '@inquirer/core';
import chalk from 'chalk';

export default createPrompt((config, done) => {
  const { choices, default: defaultKey = 'm' } = config;
  const [status, setStatus] = useState('pending');
  const [index, setIndex] = useState(choices.findIndex((choice) => choice.value === defaultKey));
  const prefix = usePrefix();

  useKeypress((key, _rl) => {
    if (isEnterKey(key)) {
      const selectedChoice = choices[index];
      if (selectedChoice) {
        setStatus('done');
        done(selectedChoice.value);
      }
    } else if (isUpKey(key)) {
      setIndex(index > 0 ? index - 1 : 0);
    } else if (isDownKey(key)) {
      setIndex(index < choices.length - 1 ? index + 1 : choices.length - 1);
    } else {
      const foundIndex = choices.findIndex((choice) => choice.value.toLowerCase() === key.name.toLowerCase());
      if (foundIndex !== -1) {
        setIndex(foundIndex);
        // This automatically finishes the prompt. Remove this if you don't want that.
        setStatus('done');
        done(choices[foundIndex].value);
      }
    }
  });

  const message = chalk.bold(config.message);

  if (status === 'done') {
    return `${prefix} ${message} ${chalk.cyan(choices[index].name)}`;
  }

  const renderedChoices = choices
    .map((choice, i) => {
      const line = `  ${choice.name}`;
      if (i === index) {
        return chalk.cyan(`> ${line}`);
      }

      return `  ${line}`;
    })
    .join('\n');

  return [`${prefix} ${message}`, renderedChoices];
});
