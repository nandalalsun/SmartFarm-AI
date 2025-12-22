package com.farmsmart.backend.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import javax.sql.DataSource;
import java.time.Duration;

/**
 * Configuration for AI-related beans.
 * 
 * This includes:
 * - ChatLanguageModel (Ollama/Llama)
 * - NamedParameterJdbcTemplate (for parameterized SQL queries)
 */
@Configuration
public class AIConfig {
    
    /**
     * Configure the Ollama chat model for AI interactions
     */
    @Bean
    public ChatLanguageModel chatLanguageModel() {
        return OllamaChatModel.builder()
                .baseUrl("http://localhost:11434")
                .modelName("llama3.2")
                .timeout(Duration.ofSeconds(60))
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
