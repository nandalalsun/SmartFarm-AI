package com.farmsmart.backend.config;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.model.googleai.GoogleAiEmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import javax.sql.DataSource;

/**
 * Configuration for AI-related beans.
 * 
 * This includes:
 * - ChatLanguageModel (Google AI)
 * - NamedParameterJdbcTemplate (for parameterized SQL queries)
 */
@Configuration
public class AIConfig {

    @Value("${google.ai.api.key}")
    private String apiKey;

    @Bean
    public ChatLanguageModel chatModel() {
        return GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName("gemini-2.5-flash")
                .temperature(0.0)
                .build();
    }

    @Bean("visionModel")
    public ChatLanguageModel visionModel() {
        return GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName("gemini-2.5-pro")
                .temperature(0.1)
                .build();
    }

    @Bean
    public EmbeddingModel embeddingModel() {
        return GoogleAiEmbeddingModel.builder()
                .apiKey(apiKey)
                .modelName("text-embedding-004")
                .build();
    }

    @Bean
    public EmbeddingStore<TextSegment> embeddingStore(
            @Value("${spring.datasource.url}") String datasourceUrl,
            @Value("${spring.datasource.username}") String username,
            @Value("${spring.datasource.password}") String password,
            @Value("${pgvector.embedding.table:embeddings}") String tableName,
            @Value("${pgvector.embedding.dimension:768}") Integer dimension) {
        
        // Extract host, port, and database from JDBC URL
        // Format: jdbc:postgresql://host:port/database
        String[] parts = datasourceUrl.replace("jdbc:postgresql://", "").split("[:/]");
        String host = parts[0];
        int port = parts.length > 1 ? Integer.parseInt(parts[1]) : 5432;
        String database = parts.length > 2 ? parts[2] : "smartfarmdb";
        
        return PgVectorEmbeddingStore.builder()
                .host(host)
                .port(port)
                .database(database)
                .user(username)
                .password(password)
                .table(tableName)
                .dimension(dimension)
                .build();
    }
    /**
     * Configure NamedParameterJdbcTemplate for parameterized SQL queries
     * This is used by the QueryPlanner for secure, non-concatenated SQL execution
     */
    @Bean
    public NamedParameterJdbcTemplate namedParameterJdbcTemplate(DataSource dataSource) {
        return new NamedParameterJdbcTemplate(dataSource);
    }
}
