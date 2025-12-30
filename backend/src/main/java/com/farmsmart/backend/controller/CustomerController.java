package com.farmsmart.backend.controller;

import com.farmsmart.backend.entity.Customer;
import com.farmsmart.backend.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    @Autowired
    private CustomerService service;
    @Autowired
    private com.farmsmart.backend.service.FinanceService financeService;

    @GetMapping
    public List<Customer> getAll() {
        return service.getAllCustomers();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'SALES', 'STAFF')")
    public Customer create(@RequestBody Customer customer) {
        return service.createCustomer(customer);
    }

    @GetMapping("/{id}/profit")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER', 'ACCOUNTANT')")
    public java.util.Map<String, Object> getProfit(@PathVariable java.util.UUID id) {
        return financeService.getFarmerProfit(id);
    }
}
