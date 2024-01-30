export const readStream = async (
  stream: ReadableStream<Uint8Array>,
  onStream: (value: string) => string) => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let innerBuffer = '';

  try {
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const decodedValue = decoder.decode(value);
      innerBuffer += onStream(decodedValue);
    }
  } catch (e) {
    console.error(e);
  }

  return {
    done,
    value: innerBuffer,
  };
};
