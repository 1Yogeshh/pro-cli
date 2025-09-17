const axios = require("axios");

async function generateAIComponent(framework, language, description) {
  const prompt = `Create a ${framework} component in ${language} for the following functionality: ${description}. The component should be clean, readable, and include proper imports, props, styling using Tailwind CSS, and export statement. Provide complete working code only, without any markdown, backticks, or formatting symbols.`;



  try {
    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (content) {
      return content;
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
