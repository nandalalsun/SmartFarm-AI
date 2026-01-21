package com.farmsmart.backend.entity;

import com.farmsmart.backend.auth.entity.User;
import com.farmsmart.backend.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private BigDecimal amount;

    private String description;

    @Column(nullable = false)
    private LocalDate expenseDate;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @ManyToOne(optional = false)
    private ExpenseCategory category;

    @ManyToOne(optional = false)
    @JoinColumn(name = "recorded_by_user_id")
    private User recordedByUser;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (expenseDate == null) {
            expenseDate = LocalDate.now();
        }
    }
}
