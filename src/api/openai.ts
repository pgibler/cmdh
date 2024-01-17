import OpenAI from "openai";

export async function generate(prompt, system) {
  try {
    const openai = new OpenAI();

    const stream = await openai.chat.completions.create({
      model: process.env.MODEL_NAME,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ],
      stream: true,
    });

    try {
      let buffer = '';
      // Collecting data from the stream
      for await (const chunk of stream) {
        // Assuming chunk is a string or can be converted to string
        const content = chunk.choices[0].delta.content
        if (content) {
          buffer += content;
        }
      }
      return buffer;
    } catch (e) {
      console.log("Failed to read stream: ", e);
    }
  } catch (e) {
    if (e.message.includes('OPENAI_API_KEY')) {
      console.log('You must set your OpenAI API key using "cmdh configure" before using the OpenAI mode.');
    } else {
      console.log('An error occurred while communicating with the OpenAI API. Please try again later.');
    }
  }
}
