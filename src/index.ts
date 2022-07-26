import { watch } from "chokidar";
import fsPromise from "fs/promises";
import { join } from "path";
import { createConnection } from "vscode-languageserver/node";
import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import { mdParser } from "./parse";
import { isLinkJournalReference, traversal } from "./traversal";

const connection = createConnection(process.stdin, process.stdout);

const files = new Map<string, string>();

connection.onInitialize((request) => {
  const projectFolders = request.workspaceFolders;

  if (projectFolders && request.processId) {
    const watcher = watch("*.md", { cwd: projectFolders[0].name });

    watcher.on("all", async (event, path) => {
      const pathAsKey = join(projectFolders[0].name, path);

      if (event === "add" || event === "change") {
        const file = await fsPromise.readFile(
          join(projectFolders[0].name, path),
          "utf8"
        );

        files.set(pathAsKey, file);
      }
    });
  }

  return {
    capabilities: {
      hoverProvider: true,
      completionProvider: {
        completionItem: { labelDetailsSupport: true },
        triggerCharacters: [":", "@"],
      },
    },
    serverInfo: {
      name: "zettel",
    },
  };
});

const convertUriToAbsolutePath = (uri: string): string => {
  return uri;
};

connection.onCompletion(async (req) => {
  // TODO: parse the file and check against current position.
  const filesArray: { path: string; content: string }[] = [];

  const readFile = await fsPromise.readFile(
    req.textDocument.uri.replace("file://", ""),
    "utf8"
  );

  files.forEach((e, key) => {
    filesArray.push({
      path: key.split("/")[key.split("/").length - 1],
      content: e,
    });
  });

  const tree = mdParser.parse(readFile);

  const nodes = traversal(tree);

  const linkNodes = nodes.filter(isLinkJournalReference);

  const { line, character } = req.position;

  let res: CompletionItem[] = [];

  for (const node of linkNodes) {
    if (node) {
      const { row, column } = node.startPosition;

      node.endPosition;

      const payload = {
        req: req.position,
        start: node.startPosition,
        end: node.endPosition,
      };

      res = [
        { label: JSON.stringify(req.context?.triggerKind) },
        {
          label: req.context?.triggerCharacter ?? "default",
        },
        {
          label: req.textDocument.uri ?? "default",
        },
      ];

      if (payload.req.line === payload.start.row) {
        res = filesArray.map((r) => ({
          label: r.path,
          kind: CompletionItemKind.File,
        }));
      }
    }
  }

  return {
    // items: filesArray.map((i) => ({ label: i.path, detail: i.content })),
    items: res,
    //items: [{ kind: CompletionItemKind.File, label: "" }],
    isIncomplete: false,
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
  };
});

connection.onHover((request) => {
  const line = request.position.line;

  const filesArray: string[] = [];

  files.forEach((e) => {
    filesArray.push(e);
  });

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
            { value: JSON.stringify(request.textDocument), language: "md" },
            { value: JSON.stringify(filesArray), language: "md" },
          ]
        : [],
  };
});

connection.listen();
