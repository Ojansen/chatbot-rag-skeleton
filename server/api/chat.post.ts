import {
    ContextChatEngine,
    HuggingFaceEmbedding,
    Ollama,
    Settings,
    FaithfulnessEvaluator, storageContextFromDefaults, SimpleDirectoryReader, VectorStoreIndex
} from "llamaindex";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);

    const dataPath = './data';
    const storagePath = './storage';

    const body = await readBody(event);

    if (!config.ollamaModel) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No model set in nuxt.config.ts',
        });
    }

    Settings.llm = new Ollama({
        model: config.ollamaModel,
    });

    Settings.embedModel = new HuggingFaceEmbedding({
        modelType: "BAAI/bge-small-en-v1.5",
        quantized: false,
    });

    const storageContext = await storageContextFromDefaults({
        persistDir: "./storage",
    });

    const reader = new SimpleDirectoryReader();
    const documents = await reader.loadData(dataPath);
    const storageFiles = await reader.loadData(storagePath);

    if (!documents.length) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No documents found for indexing.',
        });
    }

    let index;
    if (storageFiles.length < 2) {
        index = await VectorStoreIndex.fromDocuments(documents, {storageContext});
    } else {
        index = await VectorStoreIndex.init({
            storageContext: storageContext,
        });
    }

    const chatEngine = new ContextChatEngine({
        chatModel: Settings.llm,
        retriever: index.asRetriever()
    });

    const evaluator = new FaithfulnessEvaluator();

    const response = await chatEngine.chat({ message: body.prompt });

    const faithful = await evaluator.evaluateResponse({
        query: body.prompt,
        response,
    });

    return { response, faithful }
});
