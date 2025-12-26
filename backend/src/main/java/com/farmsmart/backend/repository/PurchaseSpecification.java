package com.farmsmart.backend.repository;

import com.farmsmart.backend.dto.TransactionFilterDTO;
import com.farmsmart.backend.entity.Purchase;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class PurchaseSpecification {

    public static Specification<Purchase> filterBy(TransactionFilterDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getCustomerId() != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), filter.getCustomerId()));
            }

            if (filter.getFromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("purchaseDate"), filter.getFromDate()));
            }

            if (filter.getToDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("purchaseDate"), filter.getToDate()));
            }
            
            // Allow sorting by date desc if needed, but usually done via Pageable or Sort param in repository
            // For now, just filtering.
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
