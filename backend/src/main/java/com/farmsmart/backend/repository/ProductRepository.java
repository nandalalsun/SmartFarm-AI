package com.farmsmart.backend.repository;

import com.farmsmart.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    boolean existsByNameAndCategory(String name, String category);

    boolean existsByNameIgnoreCaseAndCategoryIgnoreCase(String name, String category);
}
