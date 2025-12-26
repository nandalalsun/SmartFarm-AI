package com.farmsmart.backend.repository;

import com.farmsmart.backend.dto.TransactionFilterDTO;
import com.farmsmart.backend.entity.Sale;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class SaleSpecification {

    public static Specification<Sale> filterBy(TransactionFilterDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getCustomerId() != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), filter.getCustomerId()));
            }

            if (filter.getFromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.getFromDate()));
            }

            if (filter.getToDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.getToDate()));
            }

            if (filter.getPaymentStatus() != null && !filter.getPaymentStatus().isEmpty()) {
                predicates.add(cb.equal(root.get("paymentStatus"), filter.getPaymentStatus()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
