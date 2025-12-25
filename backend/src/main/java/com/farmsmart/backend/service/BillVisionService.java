package com.farmsmart.backend.service;

import com.farmsmart.backend.dto.ExtractedBillDTO;
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
            You are a professional invoice parser. Your output must be a single JSON object. 
            Do not include markdown formatting, backticks (```), or any conversational text. 
            If a field is missing, use null.
            JSON Schema:
            {
               "customer_name": string,
               "date": string,
               "items": [{ "product_name": string, "quantity": number, "unit_price": number, "line_total": number }],
               "total_amount": number
            }
            """;

    public BillVisionService(@Qualifier("visionModel") ChatLanguageModel visionModel) {
        this.visionModel = visionModel;
        this.objectMapper = new ObjectMapper();
    }

    public ExtractedBillDTO extractBillData(MultipartFile image) throws IOException {
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
                return objectMapper.readValue(jsonStr, ExtractedBillDTO.class);
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
