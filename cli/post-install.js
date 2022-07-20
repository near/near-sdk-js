import { executeCommand } from './utils.js';

console.log('Installing external dependencies...');

await executeCommand('touch test.txt');
await executeCommand('mkdir VASA');