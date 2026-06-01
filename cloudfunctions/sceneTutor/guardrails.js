const SUPPORTED_TASKS = new Set([
  "ask",
  "generate_sentence",
  "generate_paragraph",
  "generate_dialogue"
]);

const MAX_QUERY_LENGTH = 500;
const MAX_MATCHED_WORDS = 5;
const MAX_SELECTED_WORDS = 5;
const SECRET_FIELD_NAMES = new Set([
  "apikey",
  "api_key",
  "llm_api_key",
  "providerkey",
  "provider_key",
  "authorization",
  "token",
  "secret"
]);

function createInvalidRequest(message) {
  return {
    ok: false,
    errorCode: "invalid_request",
    message
  };
}

function hasSecretLikeField(value) {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.entries(value).some(([key, nestedValue]) => {
    if (SECRET_FIELD_NAMES.has(key.toLowerCase())) {
      return true;
    }

    return hasSecretLikeField(nestedValue);
  });
}

function isMakeSentencesTask(task) {
  return (
    task === "generate_sentence" ||
    task === "generate_paragraph" ||
    task === "generate_dialogue"
  );
}

function validateSceneTutorRequest(event) {
  if (!event || typeof event !== "object") {
    return createInvalidRequest("Scene Tutor request is required.");
  }

  if (!SUPPORTED_TASKS.has(event.task)) {
    return createInvalidRequest("Unsupported Scene Tutor task.");
  }

  if (hasSecretLikeField(event)) {
    return createInvalidRequest("Scene Tutor request must not include secret fields.");
  }

  const context = event.context;

  if (!context || typeof context !== "object") {
    return createInvalidRequest("Scene Tutor context is required.");
  }

  const sceneId = context.scene && context.scene.id;

  if (typeof sceneId !== "string" || sceneId.trim().length === 0) {
    return createInvalidRequest("Scene Tutor scene id is required.");
  }

  const query = context.query;

  if (typeof query !== "string") {
    return createInvalidRequest("Scene Tutor query is required.");
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return createInvalidRequest("Scene Tutor query is too long.");
  }

  if (!Array.isArray(context.matchedWords)) {
    return createInvalidRequest("Scene Tutor matched words are required.");
  }

  if (context.matchedWords.length > MAX_MATCHED_WORDS) {
    return createInvalidRequest("Scene Tutor matched words exceed the limit.");
  }

  if (!Array.isArray(context.selectedWordIds)) {
    return createInvalidRequest("Scene Tutor selected words are required.");
  }

  if (isMakeSentencesTask(event.task) && context.selectedWordIds.length > MAX_SELECTED_WORDS) {
    return createInvalidRequest("Scene Tutor selected words exceed the limit.");
  }

  return {
    ok: true
  };
}

module.exports = {
  MAX_MATCHED_WORDS,
  MAX_QUERY_LENGTH,
  MAX_SELECTED_WORDS,
  SUPPORTED_TASKS,
  validateSceneTutorRequest
};
