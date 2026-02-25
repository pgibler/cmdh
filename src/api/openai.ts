import OpenAI from "openai";

export async function generate(prompt: string, system: string) {
  try {
    const openai = new OpenAI();

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_NAME || '',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices?.[0]?.message?.content;
    if (typeof content === 'string') {
      return content;
    }
    throw new Error('OpenAI response did not contain text content.');
  } catch (e: any) {
    if (e.message?.includes('OPENAI_API_KEY')) {
      console.error('You must set your OpenAI API key using "cmdh configure" before using the OpenAI mode.');
    } else {
      console.error('An error occurred while communicating with the OpenAI API. Please try again later.');
      if (e.message) {
        console.error(`Error message: ${e.message}`)
      }
    }
  }
}
