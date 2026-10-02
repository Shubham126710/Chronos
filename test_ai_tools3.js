const { z } = require("zod");
const { createGoogleGenerativeAI } = require("@ai-sdk/google");
const { generateText, tool } = require("ai");

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const aiModel = google('gemini-1.5-flash');

const tools = {
  myTool: tool({
    description: "Always returns a string",
    parameters: z.object({ input: z.string() }),
    execute: async (args) => {
      return "tool executed";
    }
  })
};

async function test() {
  try {
    let messages = [{ role: "user", content: "call myTool" }];
    const result = await generateText({
      model: aiModel,
      messages,
      tools,
    });
    
    messages.push({
      role: "assistant",
      content: result.toolCalls.map(tc => ({
        type: "tool-call",
        toolCallId: tc.toolCallId,
        toolName: tc.toolName,
        args: tc.args
      }))
    });
    messages.push({
      role: "tool",
      content: [{
        type: "tool-result",
        toolCallId: result.toolCalls[0].toolCallId,
        toolName: "myTool",
        result: "tool executed"
      }]
    });

    console.log("Calling again...");
    await generateText({
      model: aiModel,
      messages,
      tools
    });
    console.log("Success");
  } catch (e) {
    console.log("Caught:", e.message);
  }
}
test();
