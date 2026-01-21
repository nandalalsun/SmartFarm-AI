package com.farmsmart.backend.repository;

import com.farmsmart.backend.dto.TransactionFilterDTO;
import com.farmsmart.backend.entity.PaymentTransaction;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class PaymentTransactionSpecification {

    public static Specification<PaymentTransaction> filterBy(TransactionFilterDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getCustomerId() != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), filter.getCustomerId()));
            }

            if (filter.getFromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("paymentDate"), filter.getFromDate()));
            }

            if (filter.getToDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("paymentDate"), filter.getToDate()));
            }

            // For the unified ledger, we only want to show "General Settlements" (those not linked to a specific Sale/Purchase)
            // or maybe we show all? The user specifically said "settlement record is not reflecting correctly".
            // If it's linked to a sale, it's already accounted for in the sale's "paidAmount" and "balance".
            // But if it's a general payment towards a customer's total balance, it has sale=null and purchase=null.
            
            predicates.add(cb.isNull(root.get("sale")));
            predicates.add(cb.isNull(root.get("purchase")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
