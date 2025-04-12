const axios = require("axios");

async function getEmbedding(text) {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/embeddings",
      {
        input: text,
        model: "text-embedding-ada-002",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    return res.data.data[0].embedding;
  } catch (err) {
    console.error("Embedding error:", err.response?.data || err.message);
    return null;
  }
}

module.exports = getEmbedding;
