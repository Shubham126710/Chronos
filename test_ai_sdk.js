const { createGoogleGenerativeAI } = require("@ai-sdk/google");
const google = createGoogleGenerativeAI({ apiKey: "dummy_key" });
try {
  const aiModel = google("gemini-2.0-flash");
  console.log("Model initialized");
} catch (e) {
  console.log("Error:", e);
}
