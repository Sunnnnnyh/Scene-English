import { describe, expect, it } from "vitest";

import { createSpeechService, speechService } from "../miniprogram/services/speechService";

describe("speechService", () => {
  it("passes when the recognized transcript matches the target word", async () => {
    const service = createSpeechService();

    const result = await service.recognizeWord("/tmp/projector.mp3", "projector", {
      transcript: " Projector "
    });

    expect(result).toEqual({
      transcript: " Projector ",
      passed: true,
      provider: "mock"
    });
  });

  it("fails when the recognized transcript is empty", async () => {
    const service = createSpeechService();

    const result = await service.recognizeWord("/tmp/projector.mp3", "projector", {
      scenario: "empty"
    });

    expect(result).toEqual({
      transcript: "",
      passed: false,
      provider: "mock"
    });
  });

  it("fails when the recognized transcript is another word", async () => {
    const service = createSpeechService();

    const result = await service.recognizeWord("/tmp/projector.mp3", "projector", {
      transcript: "socket"
    });

    expect(result).toEqual({
      transcript: "socket",
      passed: false,
      provider: "mock"
    });
  });

  it("supports a deterministic success scenario for demos", async () => {
    const service = createSpeechService({ defaultScenario: "success" });

    const result = await service.recognizeWord("/tmp/socket.mp3", "socket");

    expect(result).toEqual({
      transcript: "socket",
      passed: true,
      provider: "mock"
    });
  });

  it("supports a deterministic failure scenario for demos", async () => {
    const service = createSpeechService({ defaultScenario: "failure" });

    const result = await service.recognizeWord("/tmp/socket.mp3", "socket");

    expect(result).toEqual({
      transcript: "unrecognized speech",
      passed: false,
      provider: "mock"
    });
  });

  it("exports a default mock speech service instance", async () => {
    const result = await speechService.recognizeWord("/tmp/podium.mp3", "podium", {
      scenario: "success"
    });

    expect(result.provider).toBe("mock");
    expect(result.passed).toBe(true);
  });
});
