import fetch, { Headers } from 'node-fetch';

export async function generate(prompt: string, system: string) {
  try {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    const body = JSON.stringify({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ],
      mode: 'instruct',
      instruction_template: 'Alpaca',
      stream: true,
    });

    const {
      TEXT_GENERATION_WEBUI_HOST,
      TEXT_GENERATION_WEBUI_PORT
    } = process.env;

    const response = await fetch(`${TEXT_GENERATION_WEBUI_HOST}:${TEXT_GENERATION_WEBUI_PORT}/v1/chat/completions`, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    if (response.ok && response.body) {
      let buffer = '';

      // Return a promise that resolves when the stream ends
      return new Promise<string>((resolve, reject) => {
        response.body.on('data', (chunk: Buffer) => {
          const textChunk = chunk.toString();
          const dataPattern = /^data: (.*)$/gm;
          let match;

          while ((match = dataPattern.exec(textChunk)) !== null) {
            const data = JSON.parse(match[1]);
            const content = data.choices[0]?.delta?.content;
            if (content) {
              buffer += content;
            }
          }
        });

        response.body.on('end', () => {
          resolve(buffer);
        });

        response.body.on('error', (err: Error) => {
          reject('Stream reading error: ' + err.message);
        });
      });
    } else {
      console.log('Failed to fetch completions: ', response.statusText);
    }
  } catch (e) {
    console.log('An error occurred while fetching completions: ', e);
  }
}
