package com.farmsmart.backend.ai.intent;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

/**
 * Represents a classified user intent along with extracted entities.
 * This is the output of the IntentClassifier and input to the QueryPlanner.
 * 
 * Example:
 * User: "How many Flu Vaccine do we have?"
 * IntentRequest: {
 *   intent: INVENTORY_CHECK_PRODUCT,
 *   entities: { "productName": "Flu Vaccine" }
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntentRequest {
    
    /**
     * The classified intent from the user query
     */
    private QueryIntent intent;
    
    /**
     * Extracted entities from the user query.
     * Common keys:
     * - productName: String
     * - customerName: String
     * - category: String
     * - threshold: Integer
     * - limit: Integer
     * - dateFrom: String (ISO format)
     * - dateTo: String (ISO format)
     * - saleId: String (UUID)
     * - customerId: String (UUID)
     * - customerType: String
     * - paymentMethod: String
     */
    @Builder.Default
    private Map<String, Object> entities = new HashMap<>();
    
    /**
     * Original user query for audit purposes
     */
    private String originalQuery;
    
    /**
     * Add an entity to the request
     */
    public void addEntity(String key, Object value) {
        entities.put(key, value);
    }
    
    /**
     * Get an entity value with type casting
     */
    @SuppressWarnings("unchecked")
    public <T> T getEntity(String key, Class<T> type) {
        Object value = entities.get(key);
        if (value == null) {
            return null;
        }
        return (T) value;
    }
    
    /**
     * Check if entity exists
     */
    public boolean hasEntity(String key) {
        return entities.containsKey(key);
    }
}
