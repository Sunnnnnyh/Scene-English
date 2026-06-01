const MAKE_SENTENCES_TASKS = new Set([
  "generate_sentence",
  "generate_paragraph",
  "generate_dialogue"
]);

function toWordSummary(word) {
  return {
    id: word.id,
    en: word.en,
    cn: word.cn,
    phonetic: word.phonetic,
    expressionEn: word.expressionEn,
    expressionCn: word.expressionCn,
    isFavorite: Boolean(word.isFavorite),
    mistakeTypes: Array.isArray(word.mistakeTypes) ? word.mistakeTypes : [],
    isLearned: Boolean(word.isLearned)
  };
}

function buildAskOutputContract() {
  return {
    type: "ask",
    answer: "short explanation focused on the current scene",
    example: "one natural English example sentence",
    relatedWords: ["word ids or English words from matched words"],
    basedOn: ["matched word ids used"]
  };
}

function buildMakeSentencesOutputContract(task) {
  return {
    type: task,
    generatedText: "sentence, short paragraph, or short dialogue based on the task",
    keyWordsUsed: ["selected or matched words used"],
    chineseHelp: "brief Chinese support for the generated English",
    trySaying: "one short speaking prompt"
  };
}

function buildSceneTutorPrompt(payload) {
  const context = payload.context;
  const matchedWords = context.matchedWords.map(toWordSummary);
  const selectedWordIds = Array.isArray(context.selectedWordIds) ? context.selectedWordIds : [];
  const outputContract = MAKE_SENTENCES_TASKS.has(payload.task)
    ? buildMakeSentencesOutputContract(payload.task)
    : buildAskOutputContract();

  const system = [
    "You are Scene Tutor, a scene-based English learning assistant.",
    "Answer only within the current scene and prioritize the provided matched words.",
    "Return valid JSON only. Do not include markdown fences or extra commentary.",
    "Keep explanations concise and learner-friendly."
  ].join("\n");

  const user = [
    `Task: ${payload.task}`,
    `Current scene: ${context.scene.nameEn} (${context.scene.id})`,
    `User query: ${context.query}`,
    `selected words: ${selectedWordIds.length > 0 ? selectedWordIds.join(", ") : "none"}`,
    `Matched words: ${JSON.stringify(matchedWords)}`,
    `Learning signals: ${JSON.stringify(context.learningSignals)}`,
    `Output JSON fields: ${JSON.stringify(outputContract)}`
  ].join("\n");

  return {
    system,
    user
  };
}

module.exports = {
  buildSceneTutorPrompt
};
