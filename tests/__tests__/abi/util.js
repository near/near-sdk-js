import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from 'url';
import {runAbiCompilerPlugin} from "near-sdk-js/lib/cli/abi.js";
import { randomBytes } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateAbiSnippet(filename) {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const tsConfigJsonPath = path.join(__dirname, '../../tsconfig.json');
    
    const filepath = path.join(__dirname, "testcases", filename);
    return runAbiCompilerPlugin(filepath, packageJsonPath, tsConfigJsonPath);
}