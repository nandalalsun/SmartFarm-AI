package com.farmsmart.backend.ai.tools;

import com.farmsmart.backend.ai.intent.IntentClassifier;
import com.farmsmart.backend.ai.intent.IntentRequest;
import com.farmsmart.backend.ai.query.QueryPlanner;
import com.farmsmart.backend.ai.query.QueryResult;
import dev.langchain4j.agent.tool.Tool;
import org.springframework.stereotype.Component;

/**
 * Intent-based database query tool for the Farm Assistant AI.
 * 
 * CRITICAL CHANGE: This tool NO LONGER accepts raw SQL from the LLM.
 * Instead, it uses intent classification and deterministic query execution.
 * 
 * Flow:
 * 1. LLM describes what it wants to know (intent + entities JSON)
 * 2. IntentClassifier parses the request
 * 3. QueryPlanner executes the appropriate SQL template
 * 4. Results are returned to LLM for natural language response
 * 
 * The LLM NEVER sees or generates SQL.
 */
@Component
public class DatabaseTool {

    private final IntentClassifier intentClassifier;
    private final QueryPlanner queryPlanner;

    public DatabaseTool(IntentClassifier intentClassifier, QueryPlanner queryPlanner) {
        this.intentClassifier = intentClassifier;
        this.queryPlanner = queryPlanner;
    }

    @Tool("""
        Query the farm database by describing what you want to know.
        You must provide a natural language description of your query,
        and I will classify it into the appropriate database query.
        
        NEVER generate SQL. Just describe what data you need.
        
        Examples:
        - "Check stock for Flu Vaccine"
        - "Find all low stock products"
        - "Get credit balance for customer John Doe"
        - "Show recent sales"
        
        I will return the data as structured results.
        """)
    public String queryDatabase(String queryDescription) {
        try {
            System.out.println("🛠️ DatabaseTool: Received query description: " + queryDescription);
            
            // Step 1: Classify the intent
            IntentRequest intentRequest = intentClassifier.classify(queryDescription);
            
            // Step 2: Execute the query using the planner
            QueryResult result = queryPlanner.execute(intentRequest);
            
            // Step 3: Format and return results
            String formattedResult = result.toFormattedString();
            System.out.println("✅ DatabaseTool: Returning results: " + formattedResult);
            
            return formattedResult;
            
        } catch (Exception e) {
            System.err.println("❌ DatabaseTool: Error: " + e.getMessage());
            e.printStackTrace();
            return "Error querying database: " + e.getMessage();
        }
    }
}
