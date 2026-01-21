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

    @OneToOne
    private Sale sale;

    @ManyToOne(optional = true)
    private Purchase purchase;
    
    @OneToOne(optional = true)
    @JoinColumn(name = "payment_transaction_id")
    private PaymentTransaction paymentTransaction;

    private BigDecimal originalDebt;
    private BigDecimal currentBalance; // Remaining debt to pay
    
    private LocalDate dueDate;
    
    // ACTIVE / CLEARED
    private String status;
    
    private String remarks;
}
