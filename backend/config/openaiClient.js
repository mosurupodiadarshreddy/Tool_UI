
const { AIProjectClient } = require("@azure/ai-projects");
const { DefaultAzureCredential } = require("@azure/identity");

// Create the client using Foundry endpoint and Azure authentication.
const projectClient = new AIProjectClient(
  process.env.AZURE_AI_PROJECT_ENDPOINT,
  new DefaultAzureCredential()
);

module.exports = projectClient;
