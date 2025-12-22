package com.farmsmart.backend.ai.intent;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Service that uses the LLM to classify user intent and extract entities.
 * 
 * CRITICAL RULES:
 * - LLM output is JSON ONLY (no SQL, no natural language)
 * - Output format: {"intent": "INTENT_NAME", "entities": {...}}
 * - If unclear, returns CLARIFICATION_NEEDED
 * - Never allows LLM to generate SQL
 * 
 * This is the ONLY interaction with the LLM before query execution.
 */
@Service
public class IntentClassifier {
    
    private final ChatLanguageModel chatModel;
    private final ObjectMapper objectMapper;
    
    public IntentClassifier(ChatLanguageModel chatModel) {
        this.chatModel = chatModel;
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Classify user query into intent and extract entities
     */
    public IntentRequest classify(String userQuery) {
        System.out.println("🤖 IntentClassifier: Classifying query: " + userQuery);
        
        String prompt = buildClassificationPrompt(userQuery);
        
        try {
            // Get JSON response from LLM
            String llmResponse = chatModel.generate(prompt);
            System.out.println("🤖 IntentClassifier: LLM raw response: " + llmResponse);
            
            // Extract JSON from response (LLM might wrap it in markdown or add explanation)
            String jsonString = extractJson(llmResponse);
            System.out.println("🤖 IntentClassifier: Extracted JSON: " + jsonString);
            
            // Parse JSON response
            Map<String, Object> responseMap = objectMapper.readValue(
                jsonString, 
                new TypeReference<Map<String, Object>>() {}
            );
            
            // Extract intent
            String intentString = (String) responseMap.get("intent");
            QueryIntent intent;
            try {
                intent = QueryIntent.valueOf(intentString);
            } catch (IllegalArgumentException e) {
                System.err.println("⚠️ IntentClassifier: Unknown intent: " + intentString + ", defaulting to UNKNOWN");
                intent = QueryIntent.UNKNOWN;
            }
            
            // Extract entities (or use empty map)
            @SuppressWarnings("unchecked")
            Map<String, Object> entities = (Map<String, Object>) responseMap.getOrDefault("entities", new HashMap<>());
            
            IntentRequest intentRequest = IntentRequest.builder()
                    .intent(intent)
                    .entities(entities)
                    .originalQuery(userQuery)
                    .build();
            
            System.out.println("✅ IntentClassifier: Classified as: " + intent);
            System.out.println("✅ IntentClassifier: Entities: " + entities);
            
            return intentRequest;
            
        } catch (JsonProcessingException e) {
            System.err.println("❌ IntentClassifier: Failed to parse JSON response: " + e.getMessage());
            // Fallback to CLARIFICATION_NEEDED
            return IntentRequest.builder()
                    .intent(QueryIntent.CLARIFICATION_NEEDED)
                    .originalQuery(userQuery)
                    .build();
        } catch (Exception e) {
            System.err.println("❌ IntentClassifier: Classification failed: " + e.getMessage());
            e.printStackTrace();
            return IntentRequest.builder()
                    .intent(QueryIntent.UNKNOWN)
                    .originalQuery(userQuery)
                    .build();
        }
    }
    
    /**
     * Build the classification prompt for the LLM
     */
    private String buildClassificationPrompt(String userQuery) {
        return """
                You are an intent classifier for a poultry farm ERP system.
                
                Your ONLY job is to classify the user's query into ONE of these intents and extract relevant entities.
                
                AVAILABLE INTENTS:
                
                INVENTORY:
                - INVENTORY_CHECK_PRODUCT: Check stock for a specific product (entities: productName)
                - INVENTORY_LOW_STOCK: Find low stock products (entities: threshold, limit)
                - INVENTORY_BY_CATEGORY: List products by category (entities: category)
                - INVENTORY_ALL: List all products (no entities needed)
                
                SALES:
                - SALES_TOTAL_BY_CUSTOMER: Sales for a customer (entities: customerName)
                - SALES_TOTAL_BY_DATE_RANGE: Sales in date range (entities: dateFrom, dateTo in ISO format)
                - SALES_BY_PRODUCT: Sales of a product (entities: productName)
                - SALES_RECENT: Recent sales (entities: limit)
                - SALES_DETAIL: Details of a sale (entities: saleId)
                
                CREDIT:
                - CREDIT_BALANCE_CUSTOMER: Credit balance of a customer (entities: customerName)
                - CREDIT_OVERDUE_ALL: All overdue credits (entities: limit)
                - CREDIT_SUMMARY: Summary of all credits (no entities needed)
                
                PAYMENTS:
                - PAYMENT_HISTORY_SALE: Payment history for a sale (entities: saleId)
                - PAYMENT_SUMMARY_BY_METHOD: Payment summary by method (entities: dateFrom, dateTo)
                - PAYMENT_HISTORY_CUSTOMER: Customer payment history (entities: customerName, limit)
                
                CUSTOMERS:
                - CUSTOMER_INFO: Customer information (entities: customerName)
                - CUSTOMER_LIST_BY_TYPE: Customers by type (entities: customerType: FARMER/BUTCHER/RETAIL)
                - CUSTOMER_LIST_ALL: All customers (no entities needed)
                
                SPECIAL:
                - KNOWLEDGE_SEARCH: Questions about chicken health, feeding, diseases (entities: query)
                - CLARIFICATION_NEEDED: Query is unclear or ambiguous
                - UNKNOWN: Doesn't match any pattern
                
                RULES:
                1. Respond with ONLY valid JSON, no explanation
                2. NEVER generate SQL
                3. If unclear, use CLARIFICATION_NEEDED
                4. Entity values should be strings, numbers, or objects (for date ranges)
                
                OUTPUT FORMAT (JSON ONLY):
                {
                  "intent": "INTENT_NAME",
                  "entities": {
                    "entityKey": "entityValue"
                  }
                }
                
                EXAMPLES:
                
                User: "How many Flu Vaccine do we have?"
                Response: {"intent": "INVENTORY_CHECK_PRODUCT", "entities": {"productName": "Flu Vaccine"}}
                
                User: "Show me products running low"
                Response: {"intent": "INVENTORY_LOW_STOCK", "entities": {"threshold": 10, "limit": 20}}
                
                User: "What does John Doe owe?"
                Response: {"intent": "CREDIT_BALANCE_CUSTOMER", "entities": {"customerName": "John Doe"}}
                
                User: "Show me stuff"
                Response: {"intent": "CLARIFICATION_NEEDED", "entities": {}}
                
                User: "How to treat Newcastle disease?"
                Response: {"intent": "KNOWLEDGE_SEARCH", "entities": {"query": "Newcastle disease treatment"}}
                
                NOW CLASSIFY THIS QUERY:
                User: "%s"
                
                Response (JSON only):
                """.formatted(userQuery);
    }
    
    /**
     * Extract JSON from LLM response (handles markdown code blocks and extra text)
     */
    private String extractJson(String llmResponse) {
        // Remove markdown code blocks if present
        String cleaned = llmResponse.trim();
        
        // Remove ```json and ``` markers
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        
        cleaned = cleaned.trim();
        
        // Find first { and last }
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        
        if (start != -1 && end != -1 && end > start) {
            return cleaned.substring(start, end + 1);
        }
        
        return cleaned;
    }
}
