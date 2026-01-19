package com.farmsmart.backend.service;

import com.farmsmart.backend.entity.PaymentTransaction;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentTransactionPaidAmount {
    List<PaymentTransaction> getPaymentTransactions();
    BigDecimal getInitialPaidAmount();
}