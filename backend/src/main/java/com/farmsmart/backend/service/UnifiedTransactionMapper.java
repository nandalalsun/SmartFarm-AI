package com.farmsmart.backend.service;

import com.farmsmart.backend.dto.UnifiedTransactionDTO;
import com.farmsmart.backend.entity.PaymentTransaction;
import com.farmsmart.backend.entity.Purchase;
import com.farmsmart.backend.entity.Sale;
import com.farmsmart.backend.utils.enums.PaymentStatus;
import com.farmsmart.backend.utils.enums.TransactionType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Optional;

@Component
public class UnifiedTransactionMapper {

    public UnifiedTransactionDTO fromSale(Sale sale) {
        BigDecimal totalPaid = calculateTotalPaid(sale);
        BigDecimal balance = resolveBalance(
                sale.getRemainingBalance(),
                sale.getTotalBillAmount(),
                totalPaid
        );

        return UnifiedTransactionDTO.builder()
                .id(sale.getId())
                .date(sale.getCreatedAt())
                .type(TransactionType.SALE)
                .customerName(sale.getCustomer().getName())
                .customerPhone(sale.getCustomer().getPhone())
                .amount(sale.getTotalBillAmount())
                .paidAmount(totalPaid)
                .balance(balance)
                .status(resolvePaymentStatus(balance, sale.getTotalBillAmount()))
                .build();
    }

    public UnifiedTransactionDTO fromPurchase(Purchase purchase) {
        BigDecimal totalPaid = calculateTotalPaid(purchase);
        BigDecimal balance = resolveBalance(
                purchase.getRemainingBalance(),
                purchase.getTotalCost(),
                totalPaid
        );

        UnifiedTransactionDTO dto = UnifiedTransactionDTO.builder()
                .id(purchase.getId())
                .date(purchase.getPurchaseDate())
                .type(TransactionType.PURCHASE)
                .amount(purchase.getTotalCost())
                .paidAmount(totalPaid)
                .balance(balance)
                .status(resolvePaymentStatus(balance, purchase.getTotalCost()))
                .quantity(purchase.getQuantity())
                .weight(purchase.getWeight())
                .build();

        populateCustomer(dto, purchase);
        return dto;
    }

    public UnifiedTransactionDTO fromSettlement(PaymentTransaction txn) {
        BigDecimal impact = isPayout(txn)
                ? txn.getAmountPaid()
                : txn.getAmountPaid().negate();

        return UnifiedTransactionDTO.builder()
                .id(txn.getId())
                .date(txn.getPaymentDate())
                .type(TransactionType.SETTLEMENT)
                .customerName(txn.getCustomer().getName())
                .customerPhone(txn.getCustomer().getPhone())
                .amount(txn.getAmountPaid())
                .paidAmount(txn.getAmountPaid())
                .balance(impact)
                .status(PaymentStatus.SETTLED)
                .transactionCategory(txn.getTransactionType())
                .build();
    }

    // ---------- helpers ----------

    private void populateCustomer(UnifiedTransactionDTO dto, Purchase purchase) {
        if (purchase.getCustomer() != null) {
            dto.setCustomerName(purchase.getCustomer().getName());
            dto.setCustomerPhone(purchase.getCustomer().getPhone());
        } else {
            dto.setCustomerName(
                    purchase.getSupplierName() != null ? purchase.getSupplierName() : "Unknown Supplier"
            );
            dto.setCustomerPhone("N/A");
        }
    }

    private PaymentStatus resolvePaymentStatus(BigDecimal balance, BigDecimal total) {
        if (balance.compareTo(BigDecimal.ZERO) == 0) return PaymentStatus.COMPLETED;
        if (balance.compareTo(total) == 0) return PaymentStatus.UNPAID;
        return PaymentStatus.PARTIAL;
    }

    private BigDecimal resolveBalance(BigDecimal stored, BigDecimal total, BigDecimal paid) {
        return stored != null ? stored : total.subtract(paid);
    }

    private boolean isPayout(PaymentTransaction txn) {
        return "PAYOUT".equalsIgnoreCase(txn.getTransactionType());
    }

    private BigDecimal calculateTotalPaid(PaymentTransactionPaidAmount entity) {
        if (entity == null || entity.getPaymentTransactions() == null) {
            return Optional.ofNullable(entity.getInitialPaidAmount()).orElse(BigDecimal.ZERO);
        }

        BigDecimal sum = entity.getPaymentTransactions().stream()
                .map(PaymentTransaction::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return sum.compareTo(BigDecimal.ZERO) == 0
                ? Optional.ofNullable(entity.getInitialPaidAmount()).orElse(BigDecimal.ZERO)
                : sum;
    }
}
