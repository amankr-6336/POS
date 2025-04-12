const axios = require("axios");
const { success, error } = require("../Utils/Utils");

const menuDescription = async (req, res) => {
  const { dishName } = req.body;
  try {
    if (!dishName) {
      return res.status(400).json({ error: "Dish name is required" });
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Write a short, clear, and tempting restaurant menu description for a dish called "${dishName}". Briefly explain what the dish is, how it's prepared, and highlight its unique taste or flavor profile in 1-2 lines.`,
          },
        ],
        max_tokens: 50,
        temperature: 0.5,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const description = response.data.choices[0].message.content;
     return res.send(success(200,description));
  } catch (err) {
    console.error("OpenAI Error:", err.message);
    res.status(500).json({ error: "Failed to generate description" });
    return res.send(error(500,"Error getting description"));
  }
};

module.exports=menuDescription
