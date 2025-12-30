package com.farmsmart.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Data
public class PaymentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JsonBackReference
    private Sale sale; // Nullable - allows payments without specific sale

    @ManyToOne(optional = false)
    private Customer customer;

    private BigDecimal amountPaid;
    
    // CASH / CHECK / ESEWA / CARD
    private String paymentMethod;
    
    private String remarks; // Optional notes about the payment
    
    private LocalDateTime paymentDate;

    @PrePersist
    protected void onCreate() {
        paymentDate = LocalDateTime.now();
    }
}
