package com.farmsmart.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Checking database extensions...");
        try {
            jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS vector");
            System.out.println("Extension 'vector' enabled successfully.");
            
            // Create embeddings table for LangChain4j
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS embeddings (
                    id uuid PRIMARY KEY,
                    embedding vector(3072),
                    text text,
                    metadata jsonb,
                    connection_id text
                );
            """); // Added connection_id just in case, typical in some versions, but standard is id, embedding, text, metadata.
            System.out.println("Table 'embeddings' checked/created.");
        } catch (Exception e) {
            System.err.println("Failed to enable 'vector' extension. Ensure pgvector is installed on the DB server.");
            e.printStackTrace();
        }
    }
}
