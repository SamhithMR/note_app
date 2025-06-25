const axios = require("axios");
const { promptTemplates, systemMessages } = require("../utils/prompts");

exports.enhanceNote = async (req, res) => {
  const { type, content, title = "Untitled", userPrompt } = req.body;

  if (!type || !content) {
    return res.status(400).json({ error: true, message: "Missing 'type' or 'content' in request body." });
  }

  const templateFn = promptTemplates[type];
  const systemMessage = systemMessages[type];

  if (!templateFn || !systemMessage) {
    return res.status(400).json({ error: true, message: "Invalid enhancement type." });
  }

  const prompt = type === "custom" ? templateFn(title, content, userPrompt) : templateFn(title, content);

  try {
    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1:free",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const resultRaw = aiResponse.data.choices[0]?.message?.content?.trim();
    if (!resultRaw) {
      return res.status(500).json({ error: true, message: "AI returned no response." });
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(resultRaw);
    } catch (e) {
      console.error("Failed to parse AI JSON:", resultRaw);
      return res.status(500).json({ error: true, message: "AI response not in expected JSON format." });
    }

    const keyMap = {
      summarize: "summary",
      improve: "content",
      expand: "expanded",
      custom: "content",
    };
    const finalContent = parsedResult?.[keyMap[type]];

    if (!finalContent) {
      return res.status(500).json({ error: true, message: "Missing expected content in AI response." });
    }

    return res.json({
      error: false,
      result: finalContent,
      message: "AI enhancement successful.",
    });
  } catch (err) {
    console.error("AI Enhance Error:", err.message);
    return res.status(500).json({ error: true, message: "Server error while processing enhancement." });
  }
};
