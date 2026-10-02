const { z } = require("zod");
const { createGoogleGenerativeAI } = require("@ai-sdk/google");
const { generateText, tool } = require("ai");

const google = createGoogleGenerativeAI({
  apiKey: "dummy",
});
const aiModel = google('gemini-1.5-flash');

const tools = {
  respondToUser: tool({
    description: "Respond to user",
    parameters: z.object({ msg: z.string() }),
    execute: async (args) => {
      return { ok: true };
    }
  })
};

async function test() {
  try {
    const result = await generateText({
      model: aiModel,
      messages: [{ role: "user", content: "test" }],
      tools,
      maxSteps: 5
    });
    console.log(result.steps);
  } catch (e) {
    console.log("Caught:", e.message);
  }
}
test();
