package com.farmsmart.backend.controller;

import com.farmsmart.backend.service.BillVisionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/vision")
public class VisionController {

    @Autowired
    private BillVisionService billVisionService;

    @PostMapping("/extract")
    public ResponseEntity<com.farmsmart.backend.dto.BillAnalysisResponse> extractBill(@RequestParam("image") MultipartFile image) throws IOException {
        System.out.println("AI Vision: Extracting bill data...");
        return ResponseEntity.ok(billVisionService.extractBillData(image));
    }
}
