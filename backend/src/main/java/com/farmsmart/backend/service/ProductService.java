package com.farmsmart.backend.service;

import com.farmsmart.backend.dto.StockAdjustmentDTO;
import com.farmsmart.backend.entity.Product;
import com.farmsmart.backend.entity.StockAdjustment;
import com.farmsmart.backend.repository.ProductRepository;
import com.farmsmart.backend.repository.StockAdjustmentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {
    @Autowired
    private ProductRepository repository;

    @Autowired
    private StockAdjustmentRepository stockAdjustmentRepository;

    public List<Product> getAllProducts() {
        return repository.findAll();
    }

    public Product createProduct(Product product) {
        // product (name and category ignore case sensitive) should be unique
        if (repository.existsByNameIgnoreCaseAndCategoryIgnoreCase(product.getName(), product.getCategory())) {
            throw new RuntimeException("Product already exists");
        }

        return repository.save(product);
    }

    public Product getProduct(UUID id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Transactional
    public StockAdjustment adjustStock(StockAdjustmentDTO dto) {
        Product product = getProduct(dto.productId());
        
        Integer currentStock = product.getCurrentStock();
        if (currentStock == null) {
            currentStock = 0;
        }

        int newStock = currentStock + dto.adjustmentQuantity();
        if (newStock < 0) {
            throw new IllegalArgumentException("Insufficient stock. Current stock: " + currentStock);
        }

        product.setCurrentStock(newStock);
        repository.save(product);

        StockAdjustment adjustment = new StockAdjustment();
        adjustment.setProduct(product);
        adjustment.setAdjustmentQuantity(dto.adjustmentQuantity());
        adjustment.setAdjustmentType(dto.adjustmentType());
        adjustment.setReason(dto.reason());
        adjustment.setAdjustedByUserId(dto.adjustedByUserId());
        
        return stockAdjustmentRepository.save(adjustment);
    }

    public List<StockAdjustmentDTO> getStockAdjustments(UUID productId) {
        return stockAdjustmentRepository.findByProductIdOrderByAdjustedAtDesc(productId)
                .stream()
                .map(sa -> new StockAdjustmentDTO(
                        sa.getId(), sa.getAdjustmentQuantity(),
                        sa.getAdjustmentType(),
                        sa.getReason(),
                        sa.getAdjustedByUserId()
                ))
                .toList();
    }
}
