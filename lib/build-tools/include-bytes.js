"use strict";
import * as t from "@babel/types";
import fs from "fs";
import path from "path";
export default function () {
    return {
        /** @type {import('@babel/traverse').Visitor} */
        visitor: {
            CallExpression(p, state) {
                // Extract the called method name.
                const name = p.node.callee.name;
                // If the method name is not "includeBytes" do nothing.
                if (name === "includeBytes") {
                    // Extract the called method arguments.
                    const args = p.node.arguments;
                    // Get the path of file
                    const filename = this.file.opts.filename;
                    // User settings
                    const root = state.opts.root || path.dirname(filename);
                    // Read binary file into bytes, so encoding is 'latin1' (each byte is 0-255, become one character)
                    const encoding = "latin1";
                    // Require first arg to be string
                    t.assertStringLiteral(args[0]);
                    // Error if filename is not found
                    if (filename === undefined || filename === "unknown")
                        throw new Error("`includeBytes` function called outside of file");
                    // Generate and locate the file
                    const fileRelPath = args[0].value; // Get literal string value
                    const filePath = path.join(root, fileRelPath);
                    const fileSrc = fs
                        .readFileSync(filePath, { encoding })
                        .toString(encoding);
                    p.replaceWith(t.stringLiteral(fileSrc));
                }
            },
        },
    };
}
