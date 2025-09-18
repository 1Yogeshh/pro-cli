const axios = require("axios");
require("dotenv").config();

async function generateAIComponent(framework, language, description) {
  const url = "https://api.openai.com/v1/chat/completions"; // ChatGPT endpoint

  console.log("Loaded API Key:", process.env.OPENAI_API_KEY ? "✅ Present" : "❌ Missing");


  const prompt = `Create a ${framework} component in ${language} for the following functionality: ${description}. 
The component should be clean, readable, and include proper imports, props, styling using Tailwind CSS, and export statement. 
Provide complete working code only, without any markdown, backticks, or formatting symbols.`;

  try {
    const response = await axios.post(
      url,
      {
        model: "gpt-4o-mini", // or gpt-4, gpt-3.5-turbo
        messages: [
          { role: "system", content: "You are a code generator AI." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2, // deterministic, less randomness
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // put your API key in env
        },
      }
    );

    const content = response.data.choices?.[0]?.message?.content;

    if (content) {
      return content.trim();
    } else {
      console.error("❌ No content found in response:", response.data);
      return null;
    }
  } catch (error) {
    if (error.response) {
      console.error("❌ API Error:", error.response.data);
    } else {
      console.error("❌ Request failed:", error.message);
    }
    return null;
  }
}

module.exports = { generateAIComponent };
