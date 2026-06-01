const MAKE_SENTENCES_TASKS = new Set([
  "generate_sentence",
  "generate_paragraph",
  "generate_dialogue"
]);

function createInvalidModelResponse() {
  return {
    ok: false,
    errorCode: "model_response_invalid",
    message: "Scene Tutor model response is invalid."
  };
}

function toStringValue(value) {
  return typeof value === "string" ? value : "";
}

function toStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function looksLikeJson(text) {
  return text.startsWith("{") || text.startsWith("[");
}

function normalizeAskResponse(parsed) {
  return {
    type: "ask",
    answer: toStringValue(parsed.answer),
    example: toStringValue(parsed.example),
    relatedWords: toStringArray(parsed.relatedWords),
    basedOn: toStringArray(parsed.basedOn)
  };
}

function normalizeMakeSentencesResponse(task, parsed) {
  return {
    type: MAKE_SENTENCES_TASKS.has(parsed.type) ? parsed.type : task,
    generatedText: toStringValue(parsed.generatedText),
    keyWordsUsed: toStringArray(parsed.keyWordsUsed),
    chineseHelp: toStringValue(parsed.chineseHelp),
    trySaying: toStringValue(parsed.trySaying)
  };
}

function normalizeParsedResponse(task, parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return createInvalidModelResponse();
  }

  return {
    ok: true,
    response: MAKE_SENTENCES_TASKS.has(task)
      ? normalizeMakeSentencesResponse(task, parsed)
      : normalizeAskResponse(parsed)
  };
}

function createPlainTextFallback(task, text) {
  if (MAKE_SENTENCES_TASKS.has(task)) {
    return {
      ok: true,
      response: {
        type: task,
        generatedText: text,
        keyWordsUsed: [],
        chineseHelp: "",
        trySaying: ""
      }
    };
  }

  return {
    ok: true,
    response: {
      type: "ask",
      answer: text,
      example: "",
      relatedWords: [],
      basedOn: []
    }
  };
}

function parseSceneTutorResponse({ task, text }) {
  const trimmedText = typeof text === "string" ? text.trim() : "";

  if (!trimmedText) {
    return createInvalidModelResponse();
  }

  if (!looksLikeJson(trimmedText)) {
    return createPlainTextFallback(task, trimmedText);
  }

  try {
    return normalizeParsedResponse(task, JSON.parse(trimmedText));
  } catch {
    return createInvalidModelResponse();
  }
}

module.exports = {
  parseSceneTutorResponse
};
