import * as t from "@babel/types";
import fs from "fs";
import path from "path";
const assertStringLiteral = t.assertStringLiteral;
export default function () {
    return {
        visitor: {
            CallExpression(p, state) {
                if (!("name" in p.node.callee)) {
                    return;
                }
                // Extract the called method name.
                const name = p.node.callee.name;
                // If the method name is not "includeBytes" do nothing.
                if (name === "includeBytes") {
                    // Extract the called method arguments.
                    const args = p.node.arguments;
                    // Get the path of file
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    const filename = this.file.opts.filename;
                    // User settings
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    const root = state.opts.root || path.dirname(filename);
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
                    const filePath = path.join(root, fileRelPath);
                    const fileSrc = fs.readFileSync(filePath, { encoding }).toString();
                    p.replaceWith(t.stringLiteral(fileSrc));
                }
            },
        },
    };
}
