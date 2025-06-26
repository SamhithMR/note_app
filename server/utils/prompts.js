module.exports = {
  promptTemplates: {
    summarize: (title, content) =>
      `Summarize the note below into 1–2 sentences. Return the result strictly in JSON format like:\n{"summary": "your summary here"}\n\nTitle: ${title}\n\nContent:\n${content}`,

    improve: (title, content) =>
      `Correct grammar and typos of the note content below **without changing its meaning**. Return only the corrected content as JSON like:\n{"content": "your corrected content here"}\n\nContent:\n${content}`,

    expand: (title, content) =>
      `Expand the note by adding detailed explanations or examples. Keep it relevant and coherent. Return the result strictly in JSON format like:\n{"expanded": "your expanded note here"}\n\nTitle: ${title}\n\nNote:\n${content}`,

    custom: (title, content, customPrompt) =>
      `${customPrompt}\n\nTitle: ${title}\n\nNote:\n${content}\n\nPlease return the result strictly as a JSON object.`
  },

  systemMessages: {
    summarize: "You are a summarization assistant. Return only a JSON object with key 'summary'. No extra text.",
    improve: "You are a grammar assistant. Return only a JSON object with key 'content'. No explanations or other text.",
    expand: "You are an explaining assistant. Return only a JSON object with key 'expanded'. No extra information.",
    custom: "You are a general-purpose assistant for a note-taking app. Follow user instructions and return a valid JSON object only."
  }
};