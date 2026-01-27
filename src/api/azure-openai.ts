import { AzureOpenAI } from "openai";

export async function generate(prompt: string, system: string) {
    try {
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const apiKey = process.env.AZURE_OPENAI_API_KEY;
        const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

        if (!endpoint) {
            throw new Error('AZURE_OPENAI_ENDPOINT environment variable is not set');
        }
        if (!apiKey) {
            throw new Error('AZURE_OPENAI_API_KEY environment variable is not set');
        }
        if (!deploymentName) {
            throw new Error('AZURE_OPENAI_DEPLOYMENT_NAME environment variable is not set');
        }

        const client = new AzureOpenAI({
            apiKey: apiKey,
            endpoint: endpoint,
            apiVersion: "2024-02-15-preview"
        });

        const stream = await client.chat.completions.create({
            model: deploymentName,
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
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    buffer += content;
                }
            }
            return buffer;
        } catch (e) {
            console.error("Failed to read stream: ", e);
        }
    } catch (e: any) {
        if (e.message.includes('AZURE_OPENAI_')) {
            console.error('You must configure your Azure OpenAI settings using "cmdh configure" before using Azure OpenAI mode.');
            console.error('Required: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT_NAME');
        } else {
            console.error('An error occurred while communicating with the Azure OpenAI API. Please try again later.');
            if (e.message) {
                console.error(`Error message: ${e.message}`);
            }
        }
    }
}