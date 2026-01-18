package com.farmsmart.backend.service;

import com.farmsmart.backend.dto.SettlementRequestDTO;
import com.farmsmart.backend.dto.UnpaidSaleDTO;
import com.farmsmart.backend.entity.CreditLedger;
import com.farmsmart.backend.entity.Customer;
import com.farmsmart.backend.entity.PaymentTransaction;
import com.farmsmart.backend.entity.Sale;
import com.farmsmart.backend.exception.ResourceNotFoundException;
import com.farmsmart.backend.repository.CreditLedgerRepository;
import com.farmsmart.backend.repository.CustomerRepository;
import com.farmsmart.backend.repository.PaymentTransactionRepository;
import com.farmsmart.backend.repository.SaleRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentSettlementService {

    @Autowired private CustomerRepository customerRepository;
    @Autowired private SaleRepository saleRepository;
    @Autowired private CreditLedgerRepository creditLedgerRepository;
    @Autowired private PaymentTransactionRepository paymentTransactionRepository;

    @Transactional
    public PaymentTransaction processSettlement(SettlementRequestDTO request) {
        // 1. Validate Customer
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // 2. Create Payment Transaction (General Payment, no Sale ID)
        PaymentTransaction txn = new PaymentTransaction();
        txn.setCustomer(customer);
        txn.setAmountPaid(request.getAmount());
        txn.setPaymentMethod(request.getPaymentMethod());
        txn.setRemarks(request.getNotes());
        if (request.getTransactionDate() != null) {
            txn.setPaymentDate(request.getTransactionDate());
        }
        
        // 3. Update Customer Balance (Running Balance Approach)
        // Logic: 
        // If balance > 0 (They owe US): Payment reduces balance (Subtract).
        // If balance < 0 (WE owe THEM): We pay them, moves balance toward zero (Add).
        
        BigDecimal currentBalance = customer.getCurrentTotalBalance();
        if (currentBalance == null) currentBalance = BigDecimal.ZERO;

        if (currentBalance.compareTo(BigDecimal.ZERO) < 0) {
            // We owe them. Payment to them (Payout) should increase balance toward 0.
            customer.setCurrentTotalBalance(currentBalance.add(request.getAmount()));
        } else {
            // They owe us. Payment from them should decrease balance toward 0.
            customer.setCurrentTotalBalance(currentBalance.subtract(request.getAmount()));
        }
        
        customerRepository.save(customer);
        
        PaymentTransaction savedTxn = paymentTransactionRepository.save(txn);

        // 4. Create Ledger Entry
        CreditLedger ledger = new CreditLedger();
        ledger.setCustomer(customer);
        ledger.setPaymentTransaction(savedTxn); // Link to txn
        
        // Ledger Debt: -Amount (Credit)
        ledger.setOriginalDebt(request.getAmount().negate()); 
        ledger.setCurrentBalance(request.getAmount().negate()); 
        
        ledger.setStatus("PAYMENT"); 
        ledger.setRemarks("Balance Settlement via " + request.getPaymentMethod());
        ledger.setDueDate(java.time.LocalDate.now());
        
        creditLedgerRepository.save(ledger);

        return savedTxn;
    }

    public List<UnpaidSaleDTO> getUnpaidSalesForCustomer(UUID customerId) {
        List<Sale> unpaidSales = saleRepository.findByCustomerIdAndPaymentStatusInOrderByCreatedAtAsc(
                customerId, List.of("UNPAID", "PARTIAL"));
        
        return unpaidSales.stream().map(sale -> {
            UnpaidSaleDTO dto = new UnpaidSaleDTO();
            dto.setSaleId(sale.getId());
            dto.setCreatedAt(sale.getCreatedAt());
            dto.setTotalAmount(sale.getTotalBillAmount());
            dto.setRemainingBalance(sale.getRemainingBalance());
            dto.setPaymentStatus(sale.getPaymentStatus());
            dto.setItemsSummary(sale.getItems().size() + " items");
            return dto;
        }).collect(Collectors.toList());
    }
}
