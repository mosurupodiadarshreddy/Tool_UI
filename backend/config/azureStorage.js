const { BlobServiceClient } = require("@azure/storage-blob");

// Connect to Azure Storage using the connection string
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

// Get the resumes container
const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

module.exports = { containerClient };