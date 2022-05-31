import { watch } from "chokidar";
import { WorkspaceFoldersInitializeParams } from "vscode-languageserver-protocol/lib/common/protocol.workspaceFolder";
import { createConnection } from "vscode-languageserver/node";

const connection = createConnection(process.stdin, process.stdout);

const worskSpaces = new Map<
  number,
  WorkspaceFoldersInitializeParams["workspaceFolders"]
>();

const events: {
  event: "add" | "addDir" | "change" | "unlink" | "unlinkDir";
  path: string;
}[] = [];

connection.onInitialize((request) => {
  const projectFolders = request.workspaceFolders;

  if (projectFolders && request.processId) {
    worskSpaces.set(request.processId, projectFolders);

    const watcher = watch("*.md", { cwd: projectFolders[0].name });

    watcher.on("all", (event, path) => {
      events.push({ event, path });
    });
  }

  return {
    capabilities: { hoverProvider: true },
    serverInfo: {
      name: "Zettle TS POC",
    },
  };
});

connection.onHover((request) => {
  const line = request.position.line;

  return {
    toJson: () => {
      return { code: 345, message: "" };
    },
    range: {
      start: { line: 3, character: 1 },
      end: { line: 3, character: 20 },
    },
    message: "message from hover",
    code: 435,
    data: "test data",
    name: "test name",
    contents:
      line > 1
        ? [
            { value: "test hover text", language: "md" },
            // @ts-ignore
            { value: JSON.stringify(events), language: "md" },
          ]
        : [],
  };
});

connection.listen();
