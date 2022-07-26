import fsPromise from "fs/promises";
import Parser from "tree-sitter";

import { mdParser } from "./parse";

type PredicateFn = (node: Parser.SyntaxNode) => boolean;

export function traversal(tree: Parser.Tree, predicate?: PredicateFn) {
  const nodes: Parser.SyntaxNode[] = [];
  const cursor = tree.walk();

  let depth = 0;

  let recurse = true;

  while (depth >= 0) {
    if (recurse && cursor.gotoFirstChild()) {
      recurse = true;
      depth += 1;
    } else if (depth > 0 && cursor.gotoNextSibling()) {
      recurse = true;
    } else if (depth > 0 && cursor.gotoParent()) {
      recurse = false;
      depth -= 1;
      continue;
    } else {
      break;
    }

    const node = cursor.currentNode;

    let t = true;

    if (predicate) {
      t = predicate(node);
    }

    if (t) nodes.push(node);
  }

  return nodes;
}

function isJournalReferenceText(text: string): boolean {
  return text.charAt(0) === ":";
}

export function isLinkJournalReference(node: Parser.SyntaxNode): boolean {
  const text = node.type === "link" && node.child(1)?.child(0)?.text;

  if (!text) {
    return false;
  }

  return isJournalReferenceText(text);
}

async function main() {
  // TODO: Remove the hardcoded vlaue.
  const file = await fsPromise.readFile(
    "/Users/endrevegh/Dropbox/obsidian/personal/journal/01-07-2021.md",
    "utf8"
  );

  const nodes = traversal(mdParser.parse(file));

  console.log(nodes.filter(isLinkJournalReference));
}

if (require.main === module) {
  main();
}
