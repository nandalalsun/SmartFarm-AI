package com.farmsmart.backend.controller;

import com.farmsmart.backend.dto.BillAnalysisResponse;
import com.farmsmart.backend.entity.BillStaging;
import com.farmsmart.backend.repository.BillStagingRepository;
import com.farmsmart.backend.service.BillVisionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/staging")
public class StagingController {

    @Autowired
    private BillVisionService billVisionService;

    @Autowired
    private BillStagingRepository billStagingRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping("/upload")
    public ResponseEntity<BillStaging> uploadBill(@RequestParam("image") MultipartFile image) throws IOException {
        // 1. Analyze with AI
        BillAnalysisResponse analysis = billVisionService.extractBillData(image);

        // 2. Save to Staging DB
        BillStaging staging = new BillStaging();
        staging.setExtractedJson(objectMapper.writeValueAsString(analysis));
        staging.setStatus("PENDING");
        // In a real app we would upload the image to S3 and save the URL.
        // For this local demo, we might skip saving the image or save as base64 if needed, 
        // but for now let's just placeholder the URL.
        staging.setImageUrl("placeholder-s3-url"); 
        
        BillStaging saved = billStagingRepository.save(staging);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<BillStaging>> getPendingBills() {
        return ResponseEntity.ok(billStagingRepository.findByStatusOrderByCreatedAtDesc("PENDING"));
    }

    // TODO: Add Confirm/Save endpoint in next iteration
}
