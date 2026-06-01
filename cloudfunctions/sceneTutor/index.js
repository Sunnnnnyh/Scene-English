const { validateSceneTutorRequest } = require("./guardrails");

async function handleSceneTutorRequest(event) {
  const guardrailResult = validateSceneTutorRequest(event);

  if (!guardrailResult.ok) {
    return guardrailResult;
  }

  return {
    ok: true,
    task: event.task
  };
}

exports.main = async (event) => handleSceneTutorRequest(event);

module.exports.handleSceneTutorRequest = handleSceneTutorRequest;
