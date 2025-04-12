const Menu = require("../Model/Menu");
const Restaurant = require("../Model/Restaurant");
const getEmbedding = require("../Utils/EmbeddedSetting"); // Your embedding util
const { success, error } = require("../Utils/Utils");
const axios = require("axios");

// Cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

// AI-based dish recommendation endpoint
const SmartMenuSearchController = async (req, res) => {
  const { query, restroId } = req.body;

  if (!query || !restroId) {
    return res.send(error(400, "Missing query or restroId"));
  }

  try {
    // Get embedding of user query
    const userEmbedding = await getEmbedding(query);

    // Get all menu items of this restaurant
    const restaurant = await Restaurant.findById(restroId).populate("menu");
    const allMenuItems = restaurant.menu;

    // Skip if no menu items
    if (!allMenuItems || allMenuItems.length === 0) {
      return res.send(success(200, { recommendations: [] }));
    }

    // Compare similarity and filter results
    const THRESHOLD = 0.8;

    allMenuItems.forEach((item) => {
      const score = cosineSimilarity(userEmbedding, item.embedding);
      console.log(`${item.name} => ${score.toFixed(4)}`);
    });

    const recommendations = allMenuItems
      .filter((item) => item.embedding && item.embedding.length > 0) // only those with embeddings
      .map((item) => {
        const score = cosineSimilarity(userEmbedding, item.embedding);
        return { item, score };
      })
      .filter((entry) => entry.score >= THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // top 5 matches
      .map((entry) => entry.item);

    return res.send(success(200, { recommendations }));
  } catch (err) {
    console.error("Assistant error:", err);
    return res.send(error(500, "AI Assistant failed"));
  }
};

const getTimeWeatherBasedRecommendationsController = async (req, res) => {
  const { restroId, lat, lon } = req.query;

  if (!restroId || !lat || !lon) {
    return res.send(error(400, "Missing restroId or location"));
  }

  try {
    // 1. Get weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    const weatherResponse = await axios.get(weatherUrl);
    const weather = weatherResponse.data.weather[0].main;
    const temp = weatherResponse.data.main.temp;

    // 2. Get time of day
    const hour = new Date().getHours();
    let timeOfDay = "morning";
    if (hour >= 12 && hour < 18) timeOfDay = "afternoon";
    else if (hour >= 18 || hour < 5) timeOfDay = "evening";

    // 3. Get menu
    const menuItems = await Menu.find({ restroId });

    if (menuItems.length === 0) {
      return res.send(
        success(200, { message: "No menu found", recommended: [] })
      );
    }

    const menuDescriptions = menuItems
      .map((m) => `${m.name}: ${m.description}`)
      .join("\n");

    const prompt = `
You are an assistant helping recommend dishes to a customer based on time and weather.
Time: ${timeOfDay}
Weather: ${weather}, ${temp}°C

Based on the following menu, suggest 5 dish names (only the name) that would be best to eat right now.

Menu:
${menuDescriptions}

Respond as an array like:
["Dish 1", "Dish 2", "Dish 3", "Dish 4", "Dish 5"]
`;

    const aiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    let dishNames = [];

    try {
      dishNames = JSON.parse(aiRes.data.choices[0].message.content); // ["Chocolate Shake", "Soup", ...]
    } catch (err) {
      console.log("AI response parse failed", err);
      return res.send(error(500, "AI response parsing failed"));
    }

    // 4. Fetch full menu data for recommended dishes
    const recommended = menuItems.filter((item) =>
      dishNames.includes(item.name)
    );

    return res.send(success(200, { recommended, weather, time: timeOfDay }));
  } catch (err) {
    console.log(err);
    return res.send(error(500, "Something went wrong"));
  }
};

module.exports = {
  SmartMenuSearchController,
  getTimeWeatherBasedRecommendationsController,
};
