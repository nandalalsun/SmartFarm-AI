package com.farmsmart.backend.repository;

import com.farmsmart.backend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {
}
