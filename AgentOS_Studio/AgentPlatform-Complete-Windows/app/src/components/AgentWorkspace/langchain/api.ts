
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const createChatModel = (apiKey: string) => {
  return new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName: "gpt-4o",
    temperature: 0.7,
  });
};

export const generateResponseWithLangChain = async (
  messages: Array<{ role: string; content: string }>,
  apiKey: string
) => {
  try {
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    const model = createChatModel(apiKey);
    
    // Create a system message template
    const systemTemplate = 
      "You are an AI assistant helping with a telecom project. Be concise and helpful. " +
      "If the query is about network infrastructure, analyze capacity needs and ROI. " +
      "If it's about customer data, focus on segmentation and lifetime value.";

    // Format chat history for LangChain
    const chatHistory = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => {
        return msg.role === 'user' 
          ? `Human: ${msg.content}` 
          : `Assistant: ${msg.content}`;
      })
      .join("\n");

    // Create prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemTemplate],
      ["human", "{input}"],
    ]);

    // Create chain
    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    
    // Get the last user message
    const lastUserMessage = messages
      .filter(msg => msg.role === 'user')
      .pop()?.content || "";

    // Execute chain
    const response = await chain.invoke({
      input: lastUserMessage,
      chat_history: chatHistory
    });

    return response;
  } catch (error) {
    console.error("LangChain error:", error);
    throw error;
  }
};
