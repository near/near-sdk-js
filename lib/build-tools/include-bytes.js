import * as t from "@babel/types";
import { readFileSync } from "fs";
import { join, dirname } from "path";
const assertStringLiteral = t.assertStringLiteral;
export default function () {
    return {
        visitor: {
            CallExpression(path, { opts, file }) {
                if (!("name" in path.node.callee)) {
                    return;
                }
                // Extract the called method name.
                const name = path.node.callee.name;
                // If the method name is not "includeBytes" do nothing.
                if (name === "includeBytes") {
                    // Extract the called method arguments.
                    const args = path.node.arguments;
                    // Get the path of file
                    const filename = file.opts.filename;
                    // User settings
                    const root = opts.root || dirname(filename);
                    // Read binary file into bytes, so encoding is 'latin1' (each byte is 0-255, become one character)
                    const encoding = "latin1";
                    const [firstArg] = args;
                    // Require first arg to be a string literal
                    assertStringLiteral(firstArg);
                    // Error if filename is not found
                    if (filename === undefined || filename === "unknown") {
                        throw new Error("`includeBytes` function called outside of file");
                    }
                    if (!("value" in firstArg && typeof firstArg.value === "string")) {
                        throw new Error(`\`includeBytes\` function called with invalid argument: ${args[0]}`);
                    }
                    // Generate and locate the file
                    const fileRelPath = firstArg.value; // Get literal string value
                    const filePath = join(root, fileRelPath);
                    const fileSrc = readFileSync(filePath, { encoding }).toString();
                    path.replaceWith(t.stringLiteral(fileSrc));
                }
            },
        },
    };
}
