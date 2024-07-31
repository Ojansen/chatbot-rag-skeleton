# Chatbot RAG skeleton

## Installation

Make sure you have te latest version of [Ollama](https://ollama.com/)

Download any model you like to use and put the name in the `nuxt.config.ts` 
```ts
runtimeConfig: {
    ollamaModel: "gemma2:latest"
}
```

Put any data sources you like to use in the `data` folder this can be (csv, pdf, txt, etc.)

**Notice**: Anytime you add, remove or change files, remove the stores inside `/storage` to make sure the indexing is run again

Start the dev server

```bash
pnpm run dev
```

If the response takes to long +1 min open the browsers console log
