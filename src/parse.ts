import Parser from "tree-sitter";
// @ts-ignore
import Markdown from "tree-sitter-markdown";
// @ts-ignore
import JavaScript from "tree-sitter-javascript";

const mdParser = new Parser();
const jsParser = new Parser();

jsParser.setLanguage(JavaScript);

mdParser.setLanguage(Markdown);

const sourceCode = `
# foo
-     bar
  baz

some text before [[ sdfsdfs ]]
`;

const tree = mdParser.parse(sourceCode);

export {};
