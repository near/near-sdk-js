import fs from 'fs';
import path from 'path';
export default function ({ types: t }) {
    return {
        visitor: {
            CallExpression(p, state) {
                let name = p.node.callee.name;
                let args = p.node.arguments;
                if (name === 'includeBytes') {
                    // Get the path of file
                    var filename = this.file.opts.filename;
                    // User settings
                    let root = state.opts.root || path.dirname(filename);
                    // Read binary file into bytes, so encoding is 'latin1' (each byte is 0-255, become one character)
                    const encoding = 'latin1';
                    // Require first arg to be string
                    t.assertStringLiteral(args[0]);
                    // Error if filename is not found
                    if (filename === undefined || filename === 'unknown')
                        throw new Error('`includeBytes` function called outside of file');
                    // Generate and locate the file
                    let fileRelPath = args[0].value; // Get literal string value
                    let filePath = path.join(root, fileRelPath);
                    let fileSrc = fs.readFileSync(filePath, { encoding }).toString(encoding);
                    p.replaceWith(t.stringLiteral(fileSrc));
                }
            },
        },
    };
}
