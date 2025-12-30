package com.farmsmart.backend.service;

import com.farmsmart.backend.dto.SettlePaymentRequest;
import com.farmsmart.backend.dto.SettlePaymentResponse;
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
import java.util.ArrayList;
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
    public SettlePaymentResponse settlePayment(SettlePaymentRequest request) {
        // 1. Validate Customer
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (customer.getCurrentTotalBalance().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Customer has no outstanding balance to settle.");
        }

        if (request.getAmount().compareTo(customer.getCurrentTotalBalance()) > 0) {
            throw new IllegalArgumentException("Payment amount exceeds total outstanding balance of " + customer.getCurrentTotalBalance());
        }

        // 2. Reduce Customer Total Balance
        customer.setCurrentTotalBalance(customer.getCurrentTotalBalance().subtract(request.getAmount()));
        customerRepository.save(customer);

        // 3. Create Payment Transaction
        PaymentTransaction txn = new PaymentTransaction();
        txn.setCustomer(customer);
        txn.setAmountPaid(request.getAmount());
        txn.setPaymentMethod(request.getPaymentMethod());
        txn.setRemarks(request.getRemarks());
        
        // If saleId is provided, link it (but don't rely only on it for logic validation, we handle that below)
        Sale targetedSale = null;
        if (request.getSaleId() != null) {
            targetedSale = saleRepository.findById(request.getSaleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));
            txn.setSale(targetedSale);
        }
        
        PaymentTransaction savedTxn = paymentTransactionRepository.save(txn);

        // 4. Distribute Payment (FIFO or Targeted)
        BigDecimal remainingPayment = request.getAmount();
        List<SettlePaymentResponse.AffectedSaleDTO> affectedSales = new ArrayList<>();
        int ledgerUpdates = 0;

        // Strategy: 
        // If specific sale target: try to pay that first.
        // Then apply remaining to oldest active ledger entries/unpaid sales.
        
        if (targetedSale != null) {
            BigDecimal amountForSale = remainingPayment.min(targetedSale.getRemainingBalance());
            
            if (amountForSale.compareTo(BigDecimal.ZERO) > 0) {
                updateSaleBalance(targetedSale, amountForSale, affectedSales);
                remainingPayment = remainingPayment.subtract(amountForSale);
            }
        }

        // Apply remaining to FIFO Ledger/Sales
        if (remainingPayment.compareTo(BigDecimal.ZERO) > 0) {
            // Get unpaid sales ordered by date
            List<Sale> unpaidSales = saleRepository.findByCustomerIdAndPaymentStatusInOrderByCreatedAtAsc(
                    customer.getId(), List.of("UNPAID", "PARTIAL"));

            for (Sale sale : unpaidSales) {
                if (remainingPayment.compareTo(BigDecimal.ZERO) <= 0) break;
                
                // Skip if this was the targeted sale we already paid
                if (targetedSale != null && sale.getId().equals(targetedSale.getId())) continue;

                BigDecimal amountForSale = remainingPayment.min(sale.getRemainingBalance());
                updateSaleBalance(sale, amountForSale, affectedSales);
                remainingPayment = remainingPayment.subtract(amountForSale);
            }
        }

        // Update Credit Ledger Entries
        // We need to sync ledger status with sales. Since ledger entries often map 1:1 to sales/purchases,
        // we can iterate through active ledgers and reduce their balance.
        // Note: This logic assumes ledger balance tracks sale balance. 
        List<CreditLedger> activeLedgers = creditLedgerRepository.findByCustomerIdAndStatusInOrderByDueDateAsc(
                customer.getId(), List.of("ACTIVE", "PARTIAL", "CREDIT"));
        
        BigDecimal ledgerPaymentPool = request.getAmount();
        
        for (CreditLedger ledger : activeLedgers) {
            if (ledgerPaymentPool.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal amountForLedger = ledgerPaymentPool.min(ledger.getCurrentBalance());
            
            ledger.setCurrentBalance(ledger.getCurrentBalance().subtract(amountForLedger));
            
            if (ledger.getCurrentBalance().compareTo(BigDecimal.ZERO) == 0) {
                ledger.setStatus("CLEARED");
            } else {
                ledger.setStatus("PARTIAL");
            }
            creditLedgerRepository.save(ledger);
            ledgerPaymentPool = ledgerPaymentPool.subtract(amountForLedger);
            ledgerUpdates++;
        }

        // Prepare Response
        SettlePaymentResponse response = new SettlePaymentResponse();
        response.setTransactionId(savedTxn.getId());
        response.setCustomerId(customer.getId());
        response.setAmountSettled(request.getAmount());
        response.setRemainingCustomerBalance(customer.getCurrentTotalBalance());
        response.setAffectedSales(affectedSales);
        response.setUpdatedLedgerEntries(ledgerUpdates);

        return response;
    }

    private void updateSaleBalance(Sale sale, BigDecimal amount, List<SettlePaymentResponse.AffectedSaleDTO> affectedSales) {
        BigDecimal prevBalance = sale.getRemainingBalance();
        sale.setRemainingBalance(sale.getRemainingBalance().subtract(amount));
        
        if (sale.getRemainingBalance().compareTo(BigDecimal.ZERO) == 0) {
            sale.setPaymentStatus("FULLY_PAID");
        } else {
            sale.setPaymentStatus("PARTIAL");
        }
        Sale savedSale = saleRepository.save(sale);
        
        SettlePaymentResponse.AffectedSaleDTO dto = new SettlePaymentResponse.AffectedSaleDTO();
        dto.setSaleId(savedSale.getId());
        dto.setPreviousBalance(prevBalance);
        dto.setNewBalance(savedSale.getRemainingBalance());
        dto.setPaymentStatus(savedSale.getPaymentStatus());
        affectedSales.add(dto);
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
