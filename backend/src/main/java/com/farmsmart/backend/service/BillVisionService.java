package com.farmsmart.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.farmsmart.backend.dto.ExtractedBillDTO;
import com.farmsmart.backend.dto.OllamaResponse;
import com.farmsmart.backend.dto.VisionRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

@Service
public class BillVisionService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private static final String OLLAMA_URL = "http://localhost:11434/api/generate";
    private static final String MODEL_NAME = "llama3.2-vision";
    
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

    public BillVisionService() {
        this.restClient = RestClient.create();
        this.objectMapper = new ObjectMapper();
    }

    public ExtractedBillDTO extractBillData(MultipartFile image) throws IOException {
        String base64Image = Base64.getEncoder().encodeToString(image.getBytes());

        VisionRequest request = VisionRequest.builder()
                .model(MODEL_NAME)
                .prompt("Extract details from this bill into JSON format. " + SYSTEM_PROMPT)
                .stream(false)
                .images(List.of(base64Image))
                .build();

        OllamaResponse response = restClient.post()
                .uri(OLLAMA_URL)
                .body(request)
                .retrieve()
                .body(OllamaResponse.class);

        if (response != null && response.getResponse() != null) {
            String jsonStr = cleanJson(response.getResponse());
            return objectMapper.readValue(jsonStr, ExtractedBillDTO.class);
        }

        throw new RuntimeException("Failed to get valid response from AI");
    }

    private String cleanJson(String raw) {
        // Remove markdown code blocks if present
        return raw.replace("```json", "").replace("```", "").trim();
    }
}
