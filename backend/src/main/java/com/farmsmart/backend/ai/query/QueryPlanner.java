package com.farmsmart.backend.ai.query;

import com.farmsmart.backend.ai.intent.IntentRequest;
import com.farmsmart.backend.ai.intent.QueryIntent;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Deterministic query execution service.
 * 
 * This service:
 * 1. Receives an IntentRequest from the IntentClassifier
 * 2. Looks up the appropriate SQL template from SqlTemplateRegistry
 * 3. Validates required parameters are present
 * 4. Executes the query using NamedParameterJdbcTemplate
 * 5. Returns structured QueryResult
 * 
 * CRITICAL: This is the ONLY place where SQL is executed for AI queries.
 * The LLM never sees or generates SQL - it only provides intent + entities.
 */
@Service
public class QueryPlanner {
    
    private final SqlTemplateRegistry templateRegistry;
    private final NamedParameterJdbcTemplate namedJdbcTemplate;
    
    public QueryPlanner(
            SqlTemplateRegistry templateRegistry,
            NamedParameterJdbcTemplate namedJdbcTemplate) {
        this.templateRegistry = templateRegistry;
        this.namedJdbcTemplate = namedJdbcTemplate;
    }
    
    /**
     * Execute a query based on the classified intent and extracted entities
     */
    public QueryResult execute(IntentRequest intentRequest) {
        System.out.println("🔧 QueryPlanner: Processing intent: " + intentRequest.getIntent());
        System.out.println("🔧 QueryPlanner: Entities: " + intentRequest.getEntities());
        
        // Special handling for non-database intents
        if (intentRequest.getIntent() == QueryIntent.CLARIFICATION_NEEDED) {
            return QueryResult.builder()
                    .intent(intentRequest.getIntent())
                    .results(List.of())
                    .executedSql("N/A - Clarification needed")
                    .build();
        }
        
        if (intentRequest.getIntent() == QueryIntent.UNKNOWN) {
            return QueryResult.builder()
                    .intent(intentRequest.getIntent())
                    .results(List.of())
                    .executedSql("N/A - Unknown intent")
                    .build();
        }
        
        if (intentRequest.getIntent() == QueryIntent.KNOWLEDGE_SEARCH) {
            return QueryResult.builder()
                    .intent(intentRequest.getIntent())
                    .results(List.of())
                    .executedSql("N/A - Knowledge base query")
                    .build();
        }
        
        // Get the SQL template for this intent
        QueryTemplate template = templateRegistry.getTemplate(intentRequest.getIntent());
        
        // Validate that all required parameters are present
        try {
            template.validateParameters(intentRequest.getEntities());
        } catch (IllegalArgumentException e) {
            System.err.println("❌ QueryPlanner: Parameter validation failed: " + e.getMessage());
            throw e;
        }
        
        // Prepare parameters for named parameter JDBC template
        Map<String, Object> params = new HashMap<>(intentRequest.getEntities());
        
        // Add default values for common optional parameters if not provided
        params.putIfAbsent("limit", 10);
        params.putIfAbsent("threshold", 10);
        
        // Execute the query
        String sql = template.getSql();
        System.out.println("🔧 QueryPlanner: Executing SQL: " + sql);
        System.out.println("🔧 QueryPlanner: Parameters: " + params);
        
        try {
            List<Map<String, Object>> results = namedJdbcTemplate.queryForList(sql, params);
            
            System.out.println("✅ QueryPlanner: Query successful, returned " + results.size() + " rows");
            System.out.println("✅ QueryPlanner: Results: " + results);
            
            return QueryResult.builder()
                    .intent(intentRequest.getIntent())
                    .results(results)
                    .executedSql(sql)
                    .build();
                    
        } catch (Exception e) {
            System.err.println("❌ QueryPlanner: Query execution failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to execute query: " + e.getMessage(), e);
        }
    }
    
    /**
     * Check if the planner can handle this intent
     */
    public boolean canHandle(QueryIntent intent) {
        return templateRegistry.hasTemplate(intent);
    }
}
