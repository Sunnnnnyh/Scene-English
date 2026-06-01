import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { parseSceneTutorResponse } = require("../cloudfunctions/sceneTutor/responseParser.js") as {
  parseSceneTutorResponse(input: { task: string; text: string }): unknown;
};

describe("cloud sceneTutor responseParser", () => {
  it("parses valid Ask AI JSON and fills missing optional arrays", () => {
    expect(
      parseSceneTutorResponse({
        task: "ask",
        text: JSON.stringify({
          type: "ask",
          answer: "A projector shows slides on a wall or screen.",
          example: "The teacher turns on the projector."
        })
      })
    ).toEqual({
      ok: true,
      response: {
        type: "ask",
        answer: "A projector shows slides on a wall or screen.",
        example: "The teacher turns on the projector.",
        relatedWords: [],
        basedOn: []
      }
    });
  });

  it("parses valid Make Sentences JSON and fills missing optional strings", () => {
    expect(
      parseSceneTutorResponse({
        task: "generate_paragraph",
        text: JSON.stringify({
          type: "generate_paragraph",
          generatedText: "The teacher uses the projector to show slides.",
          keyWordsUsed: ["projector"]
        })
      })
    ).toEqual({
      ok: true,
      response: {
        type: "generate_paragraph",
        generatedText: "The teacher uses the projector to show slides.",
        keyWordsUsed: ["projector"],
        chineseHelp: "",
        trySaying: ""
      }
    });
  });

  it("turns plain text into a structured fallback response", () => {
    expect(
      parseSceneTutorResponse({
        task: "ask",
        text: "A projector is a classroom device for showing slides."
      })
    ).toEqual({
      ok: true,
      response: {
        type: "ask",
        answer: "A projector is a classroom device for showing slides.",
        example: "",
        relatedWords: [],
        basedOn: []
      }
    });
  });

  it("returns model_response_invalid for malformed JSON-like text", () => {
    expect(
      parseSceneTutorResponse({
        task: "ask",
        text: '{"type":"ask",'
      })
    ).toEqual({
      ok: false,
      errorCode: "model_response_invalid",
      message: "Scene Tutor model response is invalid."
    });
  });

  it("returns model_response_invalid for empty text", () => {
    expect(
      parseSceneTutorResponse({
        task: "ask",
        text: "   "
      })
    ).toEqual({
      ok: false,
      errorCode: "model_response_invalid",
      message: "Scene Tutor model response is invalid."
    });
  });
});
