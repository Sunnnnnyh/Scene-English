const SUPPORTED_TASKS = new Set([
  "ask",
  "generate_sentence",
  "generate_paragraph",
  "generate_dialogue"
]);

const MAX_QUERY_LENGTH = 500;

function createInvalidRequest(message) {
  return {
    ok: false,
    errorCode: "invalid_request",
    message
  };
}

function validateSceneTutorRequest(event) {
  if (!event || typeof event !== "object") {
    return createInvalidRequest("Scene Tutor request is required.");
  }

  if (!SUPPORTED_TASKS.has(event.task)) {
    return createInvalidRequest("Unsupported Scene Tutor task.");
  }

  const query = event.context && event.context.query;

  if (typeof query !== "string") {
    return createInvalidRequest("Scene Tutor query is required.");
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return createInvalidRequest("Scene Tutor query is too long.");
  }

  return {
    ok: true
  };
}

module.exports = {
  MAX_QUERY_LENGTH,
  SUPPORTED_TASKS,
  validateSceneTutorRequest
};
