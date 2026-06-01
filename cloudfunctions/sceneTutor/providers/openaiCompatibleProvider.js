const DEFAULT_MODEL = "deepseek-v4-flash";
const DEFAULT_TEMPERATURE = 0.3;

function createProviderNotConfiguredResult() {
  return {
    ok: false,
    errorCode: "provider_not_configured",
    message: "Scene Tutor provider is not configured."
  };
}

function createProviderErrorResult(status) {
  return {
    ok: false,
    errorCode: "provider_error",
    status,
    message: "Scene Tutor provider request failed."
  };
}

function normalizeBaseUrl(baseUrl) {
  return baseUrl.replace(/\/+$/u, "");
}

function getProviderConfig(env) {
  const apiKey = env.LLM_API_KEY;
  const baseUrl = env.LLM_BASE_URL;
  const model = env.LLM_MODEL || DEFAULT_MODEL;

  if (!apiKey || !baseUrl) {
    return undefined;
  }

  return {
    apiKey,
    baseUrl: normalizeBaseUrl(baseUrl),
    model
  };
}

async function callOpenAiCompatibleProvider({ messages, request, env = process.env }) {
  const config = getProviderConfig(env);

  if (!config) {
    return createProviderNotConfiguredResult();
  }

  try {
    const response = await request(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: DEFAULT_TEMPERATURE
      })
    });

    if (!response.ok) {
      return createProviderErrorResult(response.status);
    }

    const data = await response.json();
    const text =
      data && data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content
        : "";

    return {
      ok: true,
      text,
      model: config.model
    };
  } catch {
    return createProviderErrorResult(undefined);
  }
}

module.exports = {
  DEFAULT_MODEL,
  callOpenAiCompatibleProvider
};
