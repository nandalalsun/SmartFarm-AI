package com.farmsmart.backend.controller;

import com.farmsmart.backend.service.DocumentIngestionService;
import com.farmsmart.backend.service.FarmAssistantService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {

    private final FarmAssistantService assistantService;
    private final DocumentIngestionService ingestionService;

    public AssistantController(FarmAssistantService assistantService, DocumentIngestionService ingestionService) {
        this.assistantService = assistantService;
        this.ingestionService = ingestionService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            String reply = assistantService.chat(message);
            return ResponseEntity.ok(Map.of("reply", reply));
        } catch (Throwable e) {
            e.printStackTrace();
            return ResponseEntity.ok(Map.of("reply", "Critical Backend Error: " + e.getMessage()));
        }
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER')")
    public ResponseEntity<String> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            ingestionService.ingestDocument(file);
            return ResponseEntity.ok("Document ingested successfully.");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to ingest document: " + e.getMessage());
        }
    }
}
