import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAudioService } from "../miniprogram/services/audioService";

type ErrorCallback = (error: unknown) => void;

class FakeAudioContext {
  src = "";
  play = vi.fn();
  stop = vi.fn();
  destroy = vi.fn();
  private errorCallbacks: ErrorCallback[] = [];

  onError(callback: ErrorCallback): void {
    this.errorCallbacks.push(callback);
  }

  triggerError(error: unknown): void {
    this.errorCallbacks.forEach((callback) => callback(error));
  }
}

describe("audioService", () => {
  let contexts: FakeAudioContext[];
  let createContext: () => FakeAudioContext;

  beforeEach(() => {
    contexts = [];
    createContext = () => {
      const context = new FakeAudioContext();
      contexts.push(context);
      return context;
    };
  });

  it("plays a word audio source", () => {
    const service = createAudioService(createContext);

    service.play("/assets/audio/projector.mp3");

    expect(contexts).toHaveLength(1);
    expect(contexts[0].src).toBe("/assets/audio/projector.mp3");
    expect(contexts[0].play).toHaveBeenCalledTimes(1);
  });

  it("stops the previous audio before playing another source", () => {
    const service = createAudioService(createContext);

    service.play("/assets/audio/projector.mp3");
    service.play("/assets/audio/socket.mp3");

    expect(contexts).toHaveLength(2);
    expect(contexts[0].stop).toHaveBeenCalledTimes(1);
    expect(contexts[0].destroy).toHaveBeenCalledTimes(1);
    expect(contexts[1].src).toBe("/assets/audio/socket.mp3");
    expect(contexts[1].play).toHaveBeenCalledTimes(1);
  });

  it("replays the current audio source without creating a new context", () => {
    const service = createAudioService(createContext);

    service.play("/assets/audio/projector.mp3");
    service.replay();

    expect(contexts).toHaveLength(1);
    expect(contexts[0].stop).toHaveBeenCalledTimes(1);
    expect(contexts[0].play).toHaveBeenCalledTimes(2);
  });

  it("passes playback errors to the caller", () => {
    const onError = vi.fn();
    const service = createAudioService(createContext);
    const error = { errMsg: "audio source not found" };

    service.play("/assets/audio/missing.mp3", { onError });
    contexts[0].triggerError(error);

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("reports synchronous play failures to the caller", () => {
    const onError = vi.fn();
    const service = createAudioService(() => {
      const context = new FakeAudioContext();
      context.play.mockImplementation(() => {
        throw new Error("play failed");
      });
      contexts.push(context);
      return context;
    });

    service.play("/assets/audio/projector.mp3", { onError });

    expect(onError).toHaveBeenCalledWith(new Error("play failed"));
  });

  it("stops and releases the active audio context", () => {
    const service = createAudioService(createContext);

    service.play("/assets/audio/projector.mp3");
    service.dispose();

    expect(contexts[0].stop).toHaveBeenCalledTimes(1);
    expect(contexts[0].destroy).toHaveBeenCalledTimes(1);
    expect(() => service.replay()).not.toThrow();
  });
});
