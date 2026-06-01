const { callOpenAiCompatibleProvider } = require("./openaiCompatibleProvider");

async function callLlmProvider({ messages, request = fetch, env = process.env }) {
  return callOpenAiCompatibleProvider({
    messages,
    request,
    env
  });
}

module.exports = {
  callLlmProvider
};
