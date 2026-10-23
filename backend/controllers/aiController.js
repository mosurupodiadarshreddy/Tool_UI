
const projectClient = require("../config/openaiClient");

// Generate an answer using the existing Foundry agent.
const generateAnswer = async (req, res) => {
  try {
    const { question } = req.body;

    // Validate the question sent by the client.
    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    // Get the client for our existing AI agent.
    const openAIClient = projectClient.getOpenAIClient({
      azureConfig: {
        allowPreview: true,
        agentName: "my-first-agent",
      },
    });

    // Send the question and generate an answer.
    const conversation = await openAIClient.conversations.create({
      items: [
        {
          type: "message",
          role: "user",
          content: question.trim(),
        },
      ],
    });

    const response = await openAIClient.responses.create({
      conversation: conversation.id,
    });

    // Return the AI-generated answer to the client.
    return res.status(200).json({
      success: true,
      question: question.trim(),
      answer: response.output_text,
    });
  } catch (error) {
    console.error("AI answer generation failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate an answer",
    });
  }
};

module.exports = { generateAnswer };
