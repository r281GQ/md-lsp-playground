import { createConnection } from "vscode-languageserver/node";

const connection = createConnection(process.stdin, process.stdout);

connection.onInitialize(() => {
  return {
    capabilities: { hoverProvider: true },
    serverInfo: {
      name: "test server",
    },
  };
});

connection.onHover(() => {
  return {
    toJson: () => {
      return { code: 345, message: "" };
    },
    message: "message from hover",
    code: 435,
    data: "test data",
    name: "test name",
    contents: [{ value: "test hover text", language: "md" }],
  };
});

connection.listen();
