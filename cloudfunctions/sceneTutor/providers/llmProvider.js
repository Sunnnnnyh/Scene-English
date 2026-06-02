const https = require("node:https");

const { callOpenAiCompatibleProvider } = require("./openaiCompatibleProvider");

function createHttpsRequest(url, options) {
  return new Promise((resolve, reject) => {
    const requestUrl = new URL(url);
    const requestOptions = {
      method: options.method || "GET",
      headers: options.headers || {}
    };
    const req = https.request(requestUrl, requestOptions, (res) => {
      let body = "";

      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        const status = res.statusCode || 0;

        resolve({
          ok: status >= 200 && status < 300,
          status,
          json: async () => JSON.parse(body || "{}"),
          text: async () => body
        });
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function callLlmProvider({ messages, request = createHttpsRequest, env = process.env }) {
  return callOpenAiCompatibleProvider({
    messages,
    request,
    env
  });
}

module.exports = {
  callLlmProvider,
  createHttpsRequest
};
