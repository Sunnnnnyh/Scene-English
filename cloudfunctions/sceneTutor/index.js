const { validateSceneTutorRequest } = require("./guardrails");
const { buildSceneTutorPrompt } = require("./promptBuilder");
const { parseSceneTutorResponse } = require("./responseParser");
const { callLlmProvider } = require("./providers/llmProvider");

async function handleSceneTutorRequest(event, dependencies = {}) {
  const guardrailResult = validateSceneTutorRequest(event);

  if (!guardrailResult.ok) {
    return guardrailResult;
  }

  const prompt = buildSceneTutorPrompt(event);
  const provider = dependencies.provider || callLlmProvider;
  const providerResult = await provider({
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user }
    ]
  });

  if (!providerResult.ok) {
    return providerResult;
  }

  const parsedResult = parseSceneTutorResponse({
    task: event.task,
    text: providerResult.text
  });

  if (!parsedResult.ok) {
    return parsedResult;
  }

  return {
    ok: true,
    response: parsedResult.response,
    model: providerResult.model
  };
}

exports.main = async (event) => handleSceneTutorRequest(event);

module.exports.handleSceneTutorRequest = handleSceneTutorRequest;
