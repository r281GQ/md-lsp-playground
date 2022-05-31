import Parser from "tree-sitter";

export function traversal(tree: Parser.Tree) {
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

    // const node = cursor.currentNode.type;
  }
}
