package com.farmsmart.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
public class CreditLedger {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    private Customer customer;

    @OneToOne(optional = false)
    private Sale sale;

    private BigDecimal originalDebt;
    private BigDecimal currentBalance; // Remaining debt to pay
    
    private LocalDate dueDate;
    
    // ACTIVE / CLEARED
    private String status;
    
    private String remarks;
}
