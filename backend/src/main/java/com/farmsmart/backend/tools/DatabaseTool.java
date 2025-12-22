package com.farmsmart.backend.tools;

import dev.langchain4j.agent.tool.Tool;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DatabaseTool {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseTool(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Tool("Execute a read-only SQL query to find facts about stock, sales, customers, or transactions. The query must start with SELECT.")
    public String executeQuery(String sql) {
        try {
            String trimmedSql = sql.trim();
            
            // AUTOMATIC FIX: Replace double quotes with single quotes for value literals
            // This handles cases like: name = "Alu" -> name = 'Alu'
            // We use a regex to target quotes following =, LIKE, or IN comparisons to avoid breaking column identifiers (e.g. SELECT "col")
            trimmedSql = trimmedSql.replaceAll("(?i)([=<>!]|LIKE)\\s*\"([^\"]+)\"", "$1 '$2'");
            
            // Basic safety check
            if (!trimmedSql.toLowerCase().startsWith("select")) {
                System.out.println("❌ DatabaseTool Blocked unsafe query: " + trimmedSql);
                return "Error: Only SELECT queries are allowed for safety.";
            }

            System.out.println("🛠️ DatabaseTool Executing: " + trimmedSql);
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(trimmedSql);
            System.out.println("✅ DatabaseTool Result: " + rows.toString());
            return rows.toString();
        } catch (Exception e) {
            System.out.println("❌ DatabaseTool Error: " + e.getMessage());
            return "Error executing query: " + e.getMessage();
        }
    }
}
