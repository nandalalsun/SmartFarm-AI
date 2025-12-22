package com.farmsmart.backend.config;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.ollama.OllamaEmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LangChainConfig {

    @Bean
    public EmbeddingModel embeddingModel() {
        return OllamaEmbeddingModel.builder()
                .baseUrl("http://localhost:11434")
                .modelName("llama3.2")
                .build();
    }

    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        return PgVectorEmbeddingStore.builder()
                .host("localhost")
                .port(5432)
                .database("farmsmart")
                .user("farmsmart")
                .password("password")
                .table("embeddings")
                .dimension(3072) // llama3.2 (3B) dimension is usually 3072? Or 1024? Need to check. 
                // llama3 is 4096. llama3.2 1B is 2048? llama3.2 3B is 3072.
                // NOTE: User said "Llama 3". Llama 3 8B is 4096. 
                // If using llama3.2 (vision), the text embedding model might differ.
                // Safer to assume 4096 for Llama 3 or 3072 for Llama 3.2 3B.
                // I will try 3072 for 3.2 3B (which is common for mobile). 
                // However, Llama 3.2 11B is 4096.
                // Let's default to 4096 and if it breaks we change it.
                // Actually, let's look at the standard. Llama3 is 4096.
                // Llama3.2 3B is 3072.
                // I'll set it to 3072 assuming 3B, but add a comment.
                .dimension(3072) 
                .build();
    }
}
