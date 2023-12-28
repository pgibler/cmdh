export const readStream = async stream => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let innerBuffer = '';

  try {
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      innerBuffer += chunkValue;
    }
  } catch (e) {
    console.error(e);
  }

  return {
    done,
    value: innerBuffer,
  };
};
