import type { SceneTutorPayloadInput, SceneTutorPayloadResult } from "../types";
import type { StorageAdapter } from "../utils/storage";
import { buildSceneTutorBaseContext } from "./sceneTutorContextService";
import { retrieveSceneTutorMatchedWords } from "./sceneTutorRetrievalService";

export function buildSceneTutorRequestPayload(
  input: SceneTutorPayloadInput,
  adapter?: StorageAdapter
): SceneTutorPayloadResult {
  const contextResult = buildSceneTutorBaseContext(input, adapter);

  if (!contextResult.ok) {
    return contextResult;
  }

  const retrievalResult = retrieveSceneTutorMatchedWords(
    {
      sceneId: input.sceneId,
      query: input.query,
      selectedWordIds: contextResult.context.selectedWordIds,
      learningSignals: contextResult.context.learningSignals
    },
    adapter
  );

  if (!retrievalResult.ok) {
    return retrievalResult;
  }

  return {
    ok: true,
    payload: {
      task: input.task,
      context: {
        ...contextResult.context,
        matchedWords: retrievalResult.matchedWords
      }
    }
  };
}
