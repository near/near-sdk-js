const { readFileSync, writeFileSync, unlinkSync } = require("fs");
const { execSync } = require("child_process");

// Load the base configuration from typedoc.json
const baseConfig = JSON.parse(readFileSync("./typedoc.json", "utf8"));

// Extend the base configuration for Markdown documentation
const markdownConfig = {
  ...baseConfig,
  githubPages: false,
  out: "markdown-docs",
  plugin: ["typedoc-plugin-markdown"],
};

// Write the extended configuration to a temporary file
const configFilePath = "./typedoc-markdown.json";
writeFileSync(configFilePath, JSON.stringify(markdownConfig, null, 2));

// Run TypeDoc with the extended configuration
try {
  execSync(`npx typedoc --options ${configFilePath}`, { stdio: "inherit" });
} finally {
  // Clean up the temporary file
  unlinkSync(configFilePath);
}
