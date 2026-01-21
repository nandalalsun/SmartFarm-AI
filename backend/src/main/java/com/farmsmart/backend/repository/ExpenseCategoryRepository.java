package com.farmsmart.backend.repository;

import com.farmsmart.backend.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, UUID> {
    Optional<ExpenseCategory> findByName(String name);
}
