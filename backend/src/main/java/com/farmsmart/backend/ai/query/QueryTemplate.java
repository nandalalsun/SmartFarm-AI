package com.farmsmart.backend.ai.query;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

/**
 * Immutable template for SQL queries.
 * Each template contains:
 * - The SQL query with named parameters (e.g., :productName)
 * - List of required parameter names
 * - Description for documentation
 */
@Data
@AllArgsConstructor
public class QueryTemplate {
    
    /**
     * SQL query string with named parameters using :paramName syntax
     * Example: "SELECT * FROM product WHERE name = :productName"
     */
    private final String sql;
    
    /**
     * List of required parameter names that must be provided
     * Example: ["productName"]
     */
    private final List<String> requiredParams;
    
    /**
     * Human-readable description of what this query does
     */
    private final String description;
    
    /**
     * Validate that all required parameters are present in the provided entities map
     */
    public void validateParameters(java.util.Map<String, Object> entities) {
        for (String param : requiredParams) {
            if (!entities.containsKey(param)) {
                throw new IllegalArgumentException(
                    "Missing required parameter: " + param + " for query: " + description
                );
            }
        }
    }
}
