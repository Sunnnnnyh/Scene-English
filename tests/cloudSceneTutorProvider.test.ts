import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const { callLlmProvider } = require("../cloudfunctions/sceneTutor/providers/llmProvider.js") as {
  callLlmProvider(input: {
    messages: Array<{ role: string; content: string }>;
    request?: (url: string, options: Record<string, unknown>) => Promise<unknown>;
    env?: Record<string, string | undefined>;
  }): Promise<unknown>;
};

describe("cloud sceneTutor LLM provider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns provider_not_configured when provider environment is incomplete", async () => {
    await expect(
      callLlmProvider({
        messages: [{ role: "user", content: "hello" }],
        env: {}
      })
    ).resolves.toEqual({
      ok: false,
      errorCode: "provider_not_configured",
      message: "Scene Tutor provider is not configured."
    });
  });

  it("does not rely on global fetch for the default CloudBase request path", () => {
    const source = readFileSync(
      new URL("../cloudfunctions/sceneTutor/providers/llmProvider.js", import.meta.url),
      "utf8"
    );

    expect(source).not.toContain("request = fetch");
    expect(source).toContain("node:https");
  });

  it("sends OpenAI-compatible chat completion request and returns model text", async () => {
    const request = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: '{"type":"ask","answer":"A projector shows slides."}'
            }
          }
        ]
      })
    }));

    await expect(
      callLlmProvider({
        messages: [
          { role: "system", content: "You are Scene Tutor." },
          { role: "user", content: "What is a projector?" }
        ],
        request,
        env: {
          LLM_API_KEY: "sk-test-secret",
          LLM_BASE_URL: "https://provider.example/v1",
          LLM_MODEL: "deepseek-v4-flash"
        }
      })
    ).resolves.toEqual({
      ok: true,
      text: '{"type":"ask","answer":"A projector shows slides."}',
      model: "deepseek-v4-flash"
    });

    expect(request).toHaveBeenCalledWith(
      "https://provider.example/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer sk-test-secret",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          model: "deepseek-v4-flash",
          messages: [
            { role: "system", content: "You are Scene Tutor." },
            { role: "user", content: "What is a projector?" }
          ],
          temperature: 0.3
        })
      })
    );
  });

  it("uses deepseek-v4-flash when LLM_MODEL is not set", async () => {
    const request = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: "ok" } }]
      })
    }));

    await callLlmProvider({
      messages: [{ role: "user", content: "hello" }],
      request,
      env: {
        LLM_API_KEY: "sk-test-secret",
        LLM_BASE_URL: "https://provider.example/v1"
      }
    });

    expect(request).toHaveBeenCalledTimes(1);

    const requestCalls = request.mock.calls as unknown as Array<[string, { body: string }]>;
    const requestOptions = requestCalls[0]?.[1];

    expect(requestOptions).toBeDefined();
    expect(JSON.parse(requestOptions?.body ?? "{}").model).toBe("deepseek-v4-flash");
  });

  it("returns provider error without leaking API key when request fails", async () => {
    const request = vi.fn(async () => ({
      ok: false,
      status: 401,
      text: async () => "bad key sk-test-secret"
    }));

    const result = await callLlmProvider({
      messages: [{ role: "user", content: "hello" }],
      request,
      env: {
        LLM_API_KEY: "sk-test-secret",
        LLM_BASE_URL: "https://provider.example/v1",
        LLM_MODEL: "deepseek-v4-flash"
      }
    });

    expect(result).toEqual({
      ok: false,
      errorCode: "provider_error",
      status: 401,
      message: "Scene Tutor provider request failed."
    });
    expect(JSON.stringify(result)).not.toContain("sk-test-secret");
  });

  it("logs sanitized request diagnostics when the provider request throws", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const request = vi.fn(async () => {
      const error = new Error("bad key sk-test-secret");

      Object.assign(error, {
        code: "ENOTFOUND"
      });

      throw error;
    });

    const result = await callLlmProvider({
      messages: [{ role: "user", content: "hello" }],
      request,
      env: {
        LLM_API_KEY: "sk-test-secret",
        LLM_BASE_URL: "https://provider.example/v1",
        LLM_MODEL: "deepseek-v4-flash"
      }
    });

    expect(result).toEqual({
      ok: false,
      errorCode: "provider_error",
      message: "Scene Tutor provider request failed."
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "Scene Tutor provider request failed.",
      expect.objectContaining({
        code: "ENOTFOUND",
        message: "bad key [redacted]",
        baseUrlHost: "provider.example",
        model: "deepseek-v4-flash"
      })
    );
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain("sk-test-secret");
  });
});
