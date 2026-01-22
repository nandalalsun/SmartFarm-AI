package com.farmsmart.backend.service;

import com.farmsmart.backend.dto.*;
import com.farmsmart.backend.entity.*;
import com.farmsmart.backend.exception.*;
import com.farmsmart.backend.repository.*;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;

@Service
@AllArgsConstructor
public class FinanceService {

    private CustomerRepository customerRepository;
    private ProductRepository productRepository;
    private SaleRepository saleRepository;
    private PurchaseRepository purchaseRepository;
    private CreditLedgerRepository creditLedgerRepository;
    private PaymentTransactionRepository paymentTransactionRepository;
    private UnifiedTransactionMapper mapper;

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "dashboardStats", allEntries = true),
            @CacheEvict(value = "customers", allEntries = true)
    })
    public Sale createSale(SaleRequestDTO request) {
        Customer customer = loadCustomer(request.getCustomerId());

        Sale sale = initSale(customer, request);
        BigDecimal totalBill = processSaleItems(sale, request.getItems());

        applyPaymentAndCredit(sale, customer, request, totalBill);

        Sale savedSale = saleRepository.save(sale);

        recordInitialPayment(savedSale, customer, request);
        createCreditLedgerIfNeeded(savedSale, customer);

        return savedSale;
    }

    private Customer loadCustomer(UUID customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    private Sale initSale(Customer customer, SaleRequestDTO request) {
        Sale sale = new Sale();
        sale.setCustomer(customer);
        sale.setSaleChannel(request.getSaleChannel());
        sale.setItems(new ArrayList<>());
        return sale;
    }

    private BigDecimal processSaleItems(Sale sale, List<SaleItemDTO> items) {
        BigDecimal total = BigDecimal.ZERO;

        for (SaleItemDTO dto : items) {
            Product product = loadProduct(dto.getProductId());
            validateAndReduceStock(product, dto.getQuantity());

            SaleItem item = buildSaleItem(sale, product, dto);
            sale.getItems().add(item);

            total = total.add(item.getLineTotal());
        }
        sale.setTotalBillAmount(total);
        return total;
    }

    private Product loadProduct(UUID productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    private void validateAndReduceStock(Product product, int quantity) {
        if (product.getCurrentStock() < quantity) {
            throw new InsufficientStockException("Not enough stock for " + product.getName());
        }
        product.setCurrentStock(product.getCurrentStock() - quantity);
        productRepository.save(product);
    }

    private SaleItem buildSaleItem(Sale sale, Product product, SaleItemDTO dto) {
        SaleItem item = new SaleItem();
        item.setSale(sale);
        item.setProduct(product);
        item.setQuantity(dto.getQuantity());
        item.setWeight(dto.getWeight());
        item.setUnitPrice(dto.getUnitPrice());
        item.setLineTotal(calculateLineTotal(dto));
        return item;
    }

    private BigDecimal calculateLineTotal(SaleItemDTO dto) {
        return Optional.ofNullable(dto.getWeight())
                .filter(w -> w.compareTo(BigDecimal.ZERO) > 0)
                .map(w -> dto.getUnitPrice().multiply(w))
                .orElse(dto.getUnitPrice().multiply(BigDecimal.valueOf(dto.getQuantity())));
    }

    private void applyPaymentAndCredit(Sale sale, Customer customer,
                                       SaleRequestDTO request, BigDecimal total) {

        sale.setInitialPaidAmount(request.getInitialPaidAmount());

        BigDecimal remaining = total.subtract(request.getInitialPaidAmount());
        if (remaining.compareTo(BigDecimal.ZERO) < 0) remaining = BigDecimal.ZERO;

        sale.setRemainingBalance(remaining);

        if (remaining.compareTo(BigDecimal.ZERO) == 0) {
            sale.setPaymentStatus("FULLY_PAID");
            return;
        }

        validateCreditLimit(customer, remaining);
        customer.setCurrentTotalBalance(customer.getCurrentTotalBalance().add(remaining));
        customerRepository.save(customer);

        sale.setPaymentStatus(
                remaining.compareTo(total) == 0 ? "UNPAID" : "PARTIAL"
        );
    }

    private void validateCreditLimit(Customer customer, BigDecimal remaining) {
        if (customer.getCreditLimit() == null) return;

        BigDecimal newDebt = customer.getCurrentTotalBalance().add(remaining);
        if (newDebt.compareTo(customer.getCreditLimit()) > 0) {
            throw new CreditLimitExceededException("Credit limit exceeded");
        }
    }

    private void recordInitialPayment(Sale sale, Customer customer, SaleRequestDTO request) {
        if (request.getInitialPaidAmount().compareTo(BigDecimal.ZERO) <= 0) return;

        PaymentTransaction txn = new PaymentTransaction();
        txn.setSale(sale);
        txn.setCustomer(customer);
        txn.setAmountPaid(request.getInitialPaidAmount());
        txn.setPaymentMethod(request.getPaymentMethod());
        txn.setTransactionType("RECEIPT"); // Sales are receipts (they pay us)
        paymentTransactionRepository.save(txn);
    }

    private void createCreditLedgerIfNeeded(Sale sale, Customer customer) {
        if (sale.getRemainingBalance().compareTo(BigDecimal.ZERO) <= 0) return;

        CreditLedger ledger = new CreditLedger();
        ledger.setCustomer(customer);
        ledger.setSale(sale);
        ledger.setOriginalDebt(sale.getRemainingBalance());
        ledger.setCurrentBalance(sale.getRemainingBalance());
        ledger.setStatus("ACTIVE");
        ledger.setDueDate(LocalDate.now().plusDays(30));
        creditLedgerRepository.save(ledger);
    }



    // CREATE PURCHASE
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "dashboardStats", allEntries = true),
            @CacheEvict(value = "customers", allEntries = true)
    })
    public Purchase createPurchase(PurchaseDTO request) {
        Product product = loadProduct(request.getProductId());
        updateStock(product, request.getQuantity());

        Purchase purchase = buildPurchase(product, request);
        applyPurchasePayment(purchase, request);

        handleFarmerPurchaseIfAny(purchase, request);

        Purchase savedPurchase = purchaseRepository.save(purchase);
        recordPurchasePayment(savedPurchase, request);

        return savedPurchase;
    }

    private void updateStock(Product product, Integer quantity) {
        if (quantity == null) return;
        product.setCurrentStock(product.getCurrentStock() + quantity);
        productRepository.save(product);
    }

    private Purchase buildPurchase(Product product, PurchaseDTO request) {
        Purchase purchase = new Purchase();
        purchase.setProduct(product);
        purchase.setQuantity(request.getQuantity());
        purchase.setUnitPrice(request.getUnitPrice());
        purchase.setWeight(request.getWeight());
        purchase.setTotalCost(request.getTotalCost());
        purchase.setInitialPaidAmount(
                request.getInitialPaidAmount() != null ? request.getInitialPaidAmount() : BigDecimal.ZERO
        );
        return purchase;
    }

    private void applyPurchasePayment(Purchase purchase, PurchaseDTO request) {
        BigDecimal remaining = request.getTotalCost()
                .subtract(purchase.getInitialPaidAmount());

        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            remaining = BigDecimal.ZERO;
        }
        purchase.setRemainingBalance(remaining);
    }

    private void handleFarmerPurchaseIfAny(Purchase purchase, PurchaseDTO request) {
        if (request.getCustomerId() == null) {
            purchase.setSupplierName(request.getSupplierName());
            return;
        }

        Customer farmer = loadFarmer(request.getCustomerId());
        purchase.setCustomer(farmer);

        if (purchase.getRemainingBalance().compareTo(BigDecimal.ZERO) > 0) {
            createFarmerCreditLedger(farmer, purchase);
            updateFarmerBalance(farmer, purchase.getRemainingBalance());
        }
    }

    private Customer loadFarmer(UUID customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (!"FARMER".equals(customer.getCustomerType())) {
            throw new IllegalArgumentException("Only FARMER customers can be linked to purchases");
        }
        return customer;
    }

    private void createFarmerCreditLedger(Customer farmer, Purchase purchase) {
        CreditLedger ledger = new CreditLedger();
        ledger.setCustomer(farmer);
        ledger.setPurchase(purchase);
        ledger.setOriginalDebt(purchase.getRemainingBalance().negate());
        ledger.setCurrentBalance(purchase.getRemainingBalance().negate());
        ledger.setStatus("CREDIT");
        ledger.setDueDate(LocalDate.now());
        creditLedgerRepository.save(ledger);
    }

    private void updateFarmerBalance(Customer farmer, BigDecimal remaining) {
        farmer.setCurrentTotalBalance(
                farmer.getCurrentTotalBalance().subtract(remaining)
        );
        customerRepository.save(farmer);
    }

    private void recordPurchasePayment(Purchase purchase, PurchaseDTO request) {
        if (purchase.getInitialPaidAmount().compareTo(BigDecimal.ZERO) <= 0) return;

        PaymentTransaction txn = new PaymentTransaction();
        txn.setPurchase(purchase);
        txn.setCustomer(purchase.getCustomer());
        txn.setAmountPaid(purchase.getInitialPaidAmount());
        txn.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH");
        txn.setTransactionType("PAYOUT"); // Purchases from farmers are payouts (we pay them)
        paymentTransactionRepository.save(txn);
    }


    public Map<String, Object> getFarmerProfit(UUID customerId) {
        List<Purchase> deliveries = purchaseRepository.findByCustomerId(customerId);
        List<Sale> inputs = saleRepository.findByCustomerId(customerId);
        List<PaymentTransaction> transactions = paymentTransactionRepository.findByCustomerId(customerId);

        BigDecimal deliveriesValue = deliveries.stream()
                .map(Purchase::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal inputsCost = inputs.stream()
                .map(Sale::getTotalBillAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPayouts = transactions.stream()
                .filter(t -> "PAYOUT".equalsIgnoreCase(t.getTransactionType()))
                .map(PaymentTransaction::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalReceipts = transactions.stream()
                .filter(t -> "RECEIPT".equalsIgnoreCase(t.getTransactionType()))
                .map(PaymentTransaction::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netSettled = totalPayouts.subtract(totalReceipts);
        BigDecimal grossProfit = deliveriesValue.subtract(inputsCost);
        BigDecimal netOutstanding = grossProfit.subtract(netSettled);

        return Map.of(
            "inputsCost", inputsCost,
            "deliveriesValue", deliveriesValue,
            "settledAmount", netSettled,
            "profit", netOutstanding,
            "grossProfit", grossProfit
        );
    }

    public List<SaleHistoryDTO> getSalesHistory() {
        return saleRepository.findAll().stream().map(this::mapToSaleHistoryDTO).toList();
    }

    public List<PurchaseHistoryDTO> getPurchaseHistory() {
        return purchaseRepository.findAll().stream().map(this::mapToPurchaseHistoryDTO).toList();
    }

    private SaleHistoryDTO mapToSaleHistoryDTO(Sale sale) {
        return SaleHistoryDTO.builder()
                .id(sale.getId())
                .date(sale.getCreatedAt())
                .customerName(sale.getCustomer().getName())
                .totalBillAmount(sale.getTotalBillAmount())
                .initialPaidAmount(sale.getInitialPaidAmount())
                .remainingBalance(sale.getRemainingBalance())
                .paymentStatus(sale.getPaymentStatus())
                .items(sale.getItems().stream().map(SaleHistoryItemDTO::new).toList())
                .paymentHistory(sale.getPaymentTransactions().stream().map(PaymentHistoryDTO::new).toList())
                .build();
    }

    private PurchaseHistoryDTO mapToPurchaseHistoryDTO(Purchase purchase) {
        PurchaseHistoryDTO dto = new PurchaseHistoryDTO();
        dto.setId(purchase.getId());
        dto.setDate(purchase.getPurchaseDate());
        if (purchase.getSupplierName() != null) {
            dto.setSupplierName(purchase.getSupplierName());
        } else if (purchase.getCustomer() != null) {
            dto.setSupplierName(purchase.getCustomer().getName() + " (Farmer)");
        }
        dto.setProductName(purchase.getProduct().getName());
        dto.setQuantity(purchase.getQuantity());
        dto.setUnitPrice(purchase.getUnitPrice());
        dto.setWeight(purchase.getWeight());
        dto.setTotalCost(purchase.getTotalCost());
        dto.setInitialPaidAmount(purchase.getInitialPaidAmount());
        dto.setRemainingBalance(purchase.getRemainingBalance());
        return dto;
    }

    public List<UnifiedTransactionDTO> getUnifiedTransactions(TransactionFilterDTO filter) {
        List<UnifiedTransactionDTO> result = new ArrayList<>();

        saleRepository.findAll(SaleSpecification.filterBy(filter))
                .forEach(s -> result.add(mapper.fromSale(s)));

        purchaseRepository.findAll(PurchaseSpecification.filterBy(filter))
                .forEach(p -> result.add(mapper.fromPurchase(p)));

        paymentTransactionRepository
                .findAll(PaymentTransactionSpecification.filterBy(filter))
                .forEach(t -> result.add(mapper.fromSettlement(t)));

        result.sort(Comparator.comparing(UnifiedTransactionDTO::getDate,
                Comparator.nullsLast(Comparator.reverseOrder())));

        return result;
    }
}