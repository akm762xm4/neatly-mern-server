import axios from "axios";

const openRouter = axios.create({
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  },
});

interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const runOpenRouter = async ({
  model = "openai/gpt-3.5-turbo", // default, can override per call
  systemPrompt = "You are a helpful assistant.",
  userPrompt,
}: {
  model?: string;
  systemPrompt?: string;
  userPrompt: string;
}): Promise<string> => {
  try {
    const response = await openRouter.post("/chat/completions", {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    return response.data?.choices?.[0]?.message?.content?.trim() || "";
  } catch (error: any) {
    console.error(
      "OpenRouter API error:",
      error.response?.data || error.message
    );
    throw new Error("AI request failed");
  }
};
