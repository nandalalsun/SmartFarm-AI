package com.farmsmart.backend.entity;

import com.farmsmart.backend.auth.entity.User;
import com.farmsmart.backend.service.PaymentTransactionPaidAmount;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Data
public class Sale implements PaymentTransactionPaidAmount {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    private Customer customer;

    private BigDecimal totalBillAmount;
    private BigDecimal initialPaidAmount;
    private BigDecimal remainingBalance;

    // FULLY_PAID / PARTIAL / UNPAID
    private String paymentStatus;

    // POS / WHATSAPP / FIELD
    private String saleChannel;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<SaleItem> items;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<PaymentTransaction> paymentTransactions = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
