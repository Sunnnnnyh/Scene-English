import type {
  SceneTutorAskResponse,
  SceneTutorMakeSentencesResponse,
  SceneTutorRequestPayload,
  SceneTutorResponse,
  SceneTutorUnavailableResult
} from "../types";
import { sceneTutorCopy } from "../utils/sceneTutorCopy";

const SCENE_TUTOR_FUNCTION_NAME = "sceneTutor";
const DEFAULT_TIMEOUT_MS = 15000;
const SECRET_FIELD_NAMES = new Set(["apikey", "llm_api_key", "providerkey", "token", "secret"]);

type CloudCallOptions = {
  name: string;
  data: unknown;
};

type CloudCallResult = {
  result?: unknown;
};

export type SceneTutorCloudAdapter = {
  callFunction(options: CloudCallOptions): Promise<CloudCallResult>;
};

export type SceneTutorCloudOptions = {
  callFunction?: SceneTutorCloudAdapter["callFunction"];
  timeoutMs?: number;
};

export type SceneTutorCloudResult =
  | {
      ok: true;
      response: SceneTutorResponse;
      model?: string;
    }
  | SceneTutorUnavailableResult;

export async function requestSceneTutor(
  payload: SceneTutorRequestPayload,
  options: SceneTutorCloudOptions = {}
): Promise<SceneTutorCloudResult> {
  const callFunction = options.callFunction ?? getDefaultCallFunction();

  if (!callFunction) {
    return unavailableResult();
  }

  try {
    const result = await withTimeout(
      callFunction({
        name: SCENE_TUTOR_FUNCTION_NAME,
        data: stripSecretFields(payload)
      }),
      options.timeoutMs ?? DEFAULT_TIMEOUT_MS
    );

    return parseCloudFunctionResult(result.result);
  } catch {
    return unavailableResult();
  }
}

function getDefaultCallFunction(): SceneTutorCloudAdapter["callFunction"] | undefined {
  const cloud = (wx as unknown as { cloud?: SceneTutorCloudAdapter }).cloud;

  return cloud?.callFunction?.bind(cloud);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("scene tutor cloud call timed out"));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error: unknown) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

function parseCloudFunctionResult(result: unknown): SceneTutorCloudResult {
  if (!isRecord(result) || result.ok !== true || !isSceneTutorResponse(result.response)) {
    return unavailableResult();
  }

  return {
    ok: true,
    response: result.response,
    ...(typeof result.model === "string" ? { model: result.model } : {})
  };
}

function isSceneTutorResponse(response: unknown): response is SceneTutorResponse {
  if (!isRecord(response) || typeof response.type !== "string") {
    return false;
  }

  if (response.type === "ask") {
    return isAskResponse(response);
  }

  return isMakeSentencesResponse(response);
}

function isAskResponse(response: Record<string, unknown>): response is SceneTutorAskResponse {
  return (
    response.type === "ask" &&
    typeof response.answer === "string" &&
    typeof response.example === "string" &&
    isStringArray(response.relatedWords) &&
    isStringArray(response.basedOn)
  );
}

function isMakeSentencesResponse(
  response: Record<string, unknown>
): response is SceneTutorMakeSentencesResponse {
  return (
    (response.type === "generate_sentence" ||
      response.type === "generate_paragraph" ||
      response.type === "generate_dialogue") &&
    typeof response.generatedText === "string" &&
    isStringArray(response.keyWordsUsed) &&
    typeof response.chineseHelp === "string" &&
    typeof response.trySaying === "string"
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function stripSecretFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => stripSecretFields(item));
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !SECRET_FIELD_NAMES.has(key.toLowerCase()))
      .map(([key, nestedValue]) => [key, stripSecretFields(nestedValue)])
  );
}

function unavailableResult(): SceneTutorUnavailableResult {
  return {
    ok: false,
    errorCode: "unavailable",
    message: sceneTutorCopy.errorUnavailable
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
