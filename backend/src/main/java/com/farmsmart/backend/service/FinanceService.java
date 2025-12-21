package com.farmsmart.backend.service;

import com.farmsmart.backend.dto.*;
import com.farmsmart.backend.entity.*;
import com.farmsmart.backend.exception.*;
import com.farmsmart.backend.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class FinanceService {

    @Autowired private CustomerRepository customerRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private SaleRepository saleRepository;
    @Autowired private PurchaseRepository purchaseRepository;
    @Autowired private CreditLedgerRepository creditLedgerRepository;

    @Transactional
    public Sale createSale(SaleRequestDTO request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Sale sale = new Sale();
        sale.setCustomer(customer);
        sale.setSaleChannel(request.getSaleChannel());
        sale.setItems(new ArrayList<>());
        
        BigDecimal totalBill = BigDecimal.ZERO;

        // Process Items & Stock
        for (SaleItemDTO itemDTO : request.getItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            if (product.getCurrentStock() < itemDTO.getQuantity()) {
                throw new InsufficientStockException("Not enough stock for " + product.getName());
            }

            // Decrement Stock
            product.setCurrentStock(product.getCurrentStock() - itemDTO.getQuantity());
            productRepository.save(product);

            SaleItem item = new SaleItem();
            item.setSale(sale);
            item.setProduct(product);
            item.setQuantity(itemDTO.getQuantity());
            item.setUnitPrice(itemDTO.getUnitPrice());
            item.setLineTotal(itemDTO.getUnitPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));
            
            sale.getItems().add(item);
            totalBill = totalBill.add(item.getLineTotal());
        }

        sale.setTotalBillAmount(totalBill);
        sale.setInitialPaidAmount(request.getInitialPaidAmount());
        
        BigDecimal remaining = totalBill.subtract(request.getInitialPaidAmount());
        if (remaining.compareTo(BigDecimal.ZERO) < 0) remaining = BigDecimal.ZERO; // No negative balance
        sale.setRemainingBalance(remaining);

        // Credit Validation
        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal newTotalDebt = customer.getCurrentTotalBalance().add(remaining);
            if (customer.getCreditLimit() != null && newTotalDebt.compareTo(customer.getCreditLimit()) > 0) {
                throw new CreditLimitExceededException("Credit limit exceeded for customer. Limit: " + customer.getCreditLimit() + ", Current Balance: " + customer.getCurrentTotalBalance());
            }
            // Update Customer Balance
            customer.setCurrentTotalBalance(newTotalDebt);
            customerRepository.save(customer);
            
            sale.setPaymentStatus("PARTIAL");
        } else {
            sale.setPaymentStatus("FULLY_PAID");
        }
        
        if (remaining.compareTo(totalBill) == 0) {
            sale.setPaymentStatus("UNPAID");
        }

        Sale savedSale = saleRepository.save(sale);

        // Record Initial Transaction (if any)
        if (request.getInitialPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            PaymentTransaction txn = new PaymentTransaction();
            txn.setSale(savedSale);
            txn.setCustomer(customer);
            txn.setAmountPaid(request.getInitialPaidAmount());
            txn.setPaymentMethod(request.getPaymentMethod());
            // txn repository not created yet, usually cascaded or separate
        }

        // Create Ledger Entry if needed
        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            CreditLedger ledger = new CreditLedger();
            ledger.setCustomer(customer);
            ledger.setSale(savedSale);
            ledger.setOriginalDebt(remaining);
            ledger.setCurrentBalance(remaining);
            ledger.setStatus("ACTIVE");
            ledger.setDueDate(LocalDate.now().plusDays(30)); // Default 30 days credit
            creditLedgerRepository.save(ledger);
        }

        return savedSale;
    }

    @Transactional
    public Purchase createPurchase(PurchaseDTO request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Increment Stock
        product.setCurrentStock(product.getCurrentStock() + request.getQuantity());
        // Update Cost Price if needed? For now just keep existing or update manual. 
        // Let's NOT auto-update avg cost for simplicity unless asked.
        productRepository.save(product);

        Purchase purchase = new Purchase();
        purchase.setProduct(product);
        purchase.setSupplierName(request.getSupplierName());
        purchase.setQuantity(request.getQuantity());
        purchase.setTotalCost(request.getTotalCost());
        
        return purchaseRepository.save(purchase);
    }

    public java.util.Map<String, Object> getProfitReport() {
        List<Sale> sales = saleRepository.findAll();
        List<Purchase> purchases = purchaseRepository.findAll();

        BigDecimal totalRevenue = sales.stream()
                .map(Sale::getTotalBillAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = purchases.stream()
                .map(Purchase::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netProfit = totalRevenue.subtract(totalExpenses);

        return java.util.Map.of(
                "totalRevenue", totalRevenue,
                "totalExpenses", totalExpenses,
                "netProfit", netProfit
        );
    }
}
