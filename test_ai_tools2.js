const { z } = require("zod");
const { createGoogleGenerativeAI } = require("@ai-sdk/google");
const { generateText, tool } = require("ai");

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy",
});
const aiModel = google('gemini-1.5-flash');

const tools = {
  respondToUser: tool({
    description: "ALWAYS call this tool to deliver your final response to the user. This tool sends the structured UI and proposed database operations to the user for confirmation.",
    parameters: z.object({
      title: z.string().describe("A short 3-6 word title of the action taken or recommended."),
      summary: z.string().describe("A concise summary (1-2 sentences) of what you analyzed or decided."),
      actionLabel: z.string().describe("A short button label (e.g. 'Apply Schedule', 'Create Task'). Use 'Confirm' if there are destructive operations."),
      details: z.array(z.string()).describe("An array of 3-4 bullet points detailing the roadmap, steps, or changes."),
      operations: z.array(z.object({
        type: z.enum([
          "CREATE_TASK", "UPDATE_TASK", "DELETE_TASK", 
          "CREATE_EVENT", "UPDATE_EVENT", "DELETE_EVENT", 
          "SEND_SLACK_MESSAGE", "CREATE_NOTION_PAGE",
          "CREATE_GOAL", "UPDATE_GOAL", "DELETE_GOAL", 
          "CREATE_HABIT", "LOG_HABIT", "SEND_EMAIL_REPLY"
        ]),
        payload: z.record(z.string(), z.any()).describe("The data payload for the operation (e.g. { title, priority } for CREATE_TASK)")
      })).optional().describe("Array of database operations to propose to the user.")
    }),
    execute: async (args) => {
      return { success: true, message: "Response sent to user. Stop generating." };
    }
  })
};

async function test() {
  try {
    console.log("Running...");
    await generateText({
      model: aiModel,
      messages: [{ role: "user", content: "test" }],
      tools,
    });
    console.log("Success");
  } catch (e) {
    console.log("Caught:", e.message);
  }
}
test();
