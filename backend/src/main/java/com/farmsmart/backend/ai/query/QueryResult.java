package com.farmsmart.backend.ai.query;

import com.farmsmart.backend.ai.intent.QueryIntent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Wrapper for query execution results with metadata for audit trail.
 * Contains both the data results and execution metadata.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueryResult {
    
    /**
     * The intent that was executed
     */
    private QueryIntent intent;
    
    /**
     * The actual query results as a list of maps
     * Each map represents one row with column names as keys
     */
    private List<Map<String, Object>> results;
    
    /**
     * The SQL query that was executed (for audit purposes)
     */
    private String executedSql;
    
    /**
     * Timestamp of query execution
     */
    @Builder.Default
    private LocalDateTime executedAt = LocalDateTime.now();
    
    /**
     * Number of rows returned
     */
    public int getResultCount() {
        return results != null ? results.size() : 0;
    }
    
    /**
     * Check if query returned any results
     */
    public boolean isEmpty() {
        return results == null || results.isEmpty();
    }
    
    /**
     * Get first result row (if exists)
     */
    public Map<String, Object> getFirstResult() {
        return isEmpty() ? null : results.get(0);
    }
    
    /**
     * Format results as a user-friendly string
     */
    public String toFormattedString() {
        if (isEmpty()) {
            return "No results found.";
        }
        
        StringBuilder sb = new StringBuilder();
        sb.append("Found ").append(getResultCount()).append(" result(s):\n");
        
        for (int i = 0; i < results.size(); i++) {
            Map<String, Object> row = results.get(i);
            sb.append("\n").append(i + 1).append(". ");
            
            row.forEach((key, value) -> {
                sb.append(key).append("=").append(value != null ? value : "null").append(", ");
            });
            
            // Remove trailing comma
            if (!row.isEmpty()) {
                sb.setLength(sb.length() - 2);
            }
        }
        
        return sb.toString();
    }
}
