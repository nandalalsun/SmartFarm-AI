package com.farmsmart.backend.controller;

import com.farmsmart.backend.dto.StockAdjustmentDTO;
import com.farmsmart.backend.entity.StockAdjustment;
import com.farmsmart.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "http://localhost:5173")
public class InventoryController {

    @Autowired
    private ProductService productService;

    @PostMapping("/adjust")
    public ResponseEntity<StockAdjustment> adjustStock(@RequestBody StockAdjustmentDTO dto) {
        return ResponseEntity.ok(productService.adjustStock(dto));
    }

    @GetMapping("/adjustments/{productId}")
    public ResponseEntity<List<StockAdjustmentDTO>> getAdjustments(@PathVariable UUID productId) {
        return ResponseEntity.ok(productService.getStockAdjustments(productId));
    }
}
