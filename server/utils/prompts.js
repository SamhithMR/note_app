module.exports = {
  promptTemplates: {
    summarize: (title, content) => `...`,
    improve: (title, content) => `...`,
    expand: (title, content) => `...`,
    custom: (title, content, customPrompt) => `...`
  },

  systemMessages: {
    summarize: "You are a summarization assistant...",
    improve: "You are a grammar assistant...",
    expand: "You are an explaining assistant...",
    custom: "You are a general-purpose assistant..."
  }
};
