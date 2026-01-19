package com.farmsmart.backend.service;

import com.farmsmart.backend.entity.Customer;
import com.farmsmart.backend.repository.CustomerRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@AllArgsConstructor
public class CustomerService {

    private CustomerRepository repository;

    public List<Customer> getAllCustomers() {
        return repository.findAll();
    }

    public Customer createCustomer(Customer customer) {
        if (customer.getPhone() != null && repository.existsByPhone(customer.getPhone())) {
            throw new RuntimeException("Phone number already exists");
        }
        return repository.save(customer);
    }
}
