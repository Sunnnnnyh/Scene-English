import type { AssetPath } from "../types";

export type AudioErrorHandler = (error: unknown) => void;

export type AudioPlaybackOptions = {
  onError?: AudioErrorHandler;
};

export type AudioContextLike = {
  src: string;
  play(): void;
  stop(): void;
  destroy(): void;
  onError(callback: AudioErrorHandler): void;
};

export type AudioContextFactory = () => AudioContextLike;

export type AudioService = {
  play(src: AssetPath, options?: AudioPlaybackOptions): void;
  stop(): void;
  replay(): void;
  dispose(): void;
};

type WxAudioGlobal = {
  wx?: {
    createInnerAudioContext?: () => AudioContextLike;
  };
};

const createDefaultAudioContext: AudioContextFactory = () => {
  const wxApi = (globalThis as WxAudioGlobal).wx;

  if (!wxApi?.createInnerAudioContext) {
    throw new Error("wx.createInnerAudioContext is not available");
  }

  return wxApi.createInnerAudioContext();
};

const stopContext = (context: AudioContextLike): void => {
  try {
    context.stop();
  } catch {
    // Stopping is best-effort cleanup; playback failure handling belongs to play callbacks.
  }
};

const destroyContext = (context: AudioContextLike): void => {
  try {
    context.destroy();
  } catch {
    // Destroy is best-effort cleanup when a page leaves or a new source starts.
  }
};

export function createAudioService(createContext = createDefaultAudioContext): AudioService {
  let currentContext: AudioContextLike | undefined;
  let currentErrorHandler: AudioErrorHandler | undefined;

  const releaseCurrentContext = (): void => {
    if (!currentContext) {
      return;
    }

    stopContext(currentContext);
    destroyContext(currentContext);
    currentContext = undefined;
    currentErrorHandler = undefined;
  };

  return {
    play(src, options = {}) {
      releaseCurrentContext();

      const context = createContext();
      currentContext = context;
      currentErrorHandler = options.onError;
      context.src = src;
      context.onError((error) => {
        options.onError?.(error);
      });

      try {
        context.play();
      } catch (error) {
        options.onError?.(error);
      }
    },

    stop() {
      if (currentContext) {
        stopContext(currentContext);
      }
    },

    replay() {
      if (!currentContext) {
        return;
      }

      stopContext(currentContext);

      try {
        currentContext.play();
      } catch (error) {
        currentErrorHandler?.(error);
      }
    },

    dispose() {
      releaseCurrentContext();
    }
  };
}

export const audioService = createAudioService();
