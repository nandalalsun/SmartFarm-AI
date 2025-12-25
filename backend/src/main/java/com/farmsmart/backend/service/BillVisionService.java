package com.farmsmart.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ImageContent;
import dev.langchain4j.data.message.TextContent;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.output.Response;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;

@Service
public class BillVisionService {

    private final ChatLanguageModel visionModel;
    private final ObjectMapper objectMapper;
    
    private static final String SYSTEM_PROMPT = """
            You are an expert ERP Data Clerk for a Poultry Farm.
            Your goal is to extract data from a bill image and format it for a Spring Boot/PostgreSQL backend.

            Context:
            - Current Farm Products: [Feed, Medicine, Live Chick, Meat, Eggs]
            - Transaction Types: SALE (we sell to others) or PURCHASE (we buy/restock).

            Task:
            1. Analyze the image and decide if it is a SALE or PURCHASE.
               - Hint: If the farm's name is in the header, it's a SALE. If a supplier name is in the header, it's a PURCHASE.
            2. Extract the date. If it's in BS (Bikram Sambat), note that.
            3. Extract items: Quantity, Product Name, Unit Price, and Total.
            4. Try to match the 'customer_name' to a 'customer_type' (FARMER, BUTCHER, or RETAIL).

            Return ONLY a JSON object:
            {
              "suggested_type": "SALE | PURCHASE",
              "confidence_score": 0.0 to 1.0,
              "data": {
                "date": "YYYY-MM-DD",
                "customer_name": "string",
                "customer_type_suggestion": "FARMER | BUTCHER | RETAIL",
                "items": [
                  {
                    "product_name": "string",
                    "quantity": number,
                    "unit": "KG | BAG | TRAY | PIECE",
                    "unit_price": decimal,
                    "line_total": decimal
                  }
                ],
                "total_amount": decimal,
                "tax_amount": decimal,
                "payment_method_hint": "CASH | CHECK | TRANSFER"
              },
              "review_required_fields": ["list of fields that were blurry or uncertain"]
            }
            """;

    public BillVisionService(@Qualifier("visionModel") ChatLanguageModel visionModel) {
        this.visionModel = visionModel;
        this.objectMapper = new ObjectMapper();
    }

    public com.farmsmart.backend.dto.BillAnalysisResponse extractBillData(MultipartFile image) throws IOException {
        String mimeType = image.getContentType() != null ? image.getContentType() : "image/jpeg";
        String base64 = Base64.getEncoder().encodeToString(image.getBytes());
        
        UserMessage userMessage = UserMessage.from(
                TextContent.from("Extract details from this bill into JSON format. " + SYSTEM_PROMPT),
                ImageContent.from(base64, mimeType)
        );

        Response<AiMessage> response = visionModel.generate(userMessage);
        
        String responseText = response.content().text();

        if (responseText != null && !responseText.isEmpty()) {
            try {
                String jsonStr = cleanJson(responseText);
                return objectMapper.readValue(jsonStr, com.farmsmart.backend.dto.BillAnalysisResponse.class);
            } catch (JsonProcessingException e) {
                System.err.println("Failed to parse AI response: " + responseText);
                throw new RuntimeException("Failed to parse bill data", e);
            }
        }

        throw new RuntimeException("Failed to get valid response from AI");
    }

    private String cleanJson(String raw) {
        // Remove markdown code blocks if present
        String cleaned = raw.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }
}
