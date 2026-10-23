
import { DefaultAzureCredential } from "@azure/identity";
import { AIProjectClient } from "@azure/ai-projects";

// Connect to your existing Azure AI Foundry project.
const endpoint =
  "https://babireddy2003-0728-resource.services.ai.azure.com/api/projects/babireddy2003-0728";

const agentName = "my-first-agent";

async function main() {
  // Authenticate with Azure and create the project client.
  const projectClient = new AIProjectClient(
    endpoint,
    new DefaultAzureCredential()
  );

  // Get a client that can communicate with the existing agent.
  const openAIClient = projectClient.getOpenAIClient({
    azureConfig: { allowPreview: true, agentName },
  });

  // Send a test question to the agent.
  const conversation = await openAIClient.conversations.create({
    items: [
      {
        type: "message",
        role: "user",
        content: "What is async and await in JavaScript?",
      },
    ],
  });

  // Generate and display the agent's answer.
  const response = await openAIClient.responses.create({
    conversation: conversation.id,
  });

  console.log("AI Answer:", response.output_text);
}

main().catch((error) => {
  console.error("Agent request failed:", error.message);
});
