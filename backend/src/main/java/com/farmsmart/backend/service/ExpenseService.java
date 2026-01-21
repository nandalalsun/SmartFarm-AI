package com.farmsmart.backend.service;

import com.farmsmart.backend.auth.entity.User;
import com.farmsmart.backend.auth.service.UserService;
import com.farmsmart.backend.dto.ExpenseDTO;
import com.farmsmart.backend.entity.Expense;
import com.farmsmart.backend.entity.ExpenseCategory;
import com.farmsmart.backend.exception.ResourceNotFoundException;
import com.farmsmart.backend.repository.ExpenseCategoryRepository;
import com.farmsmart.backend.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryRepository categoryRepository;
    private final UserService userService;

    @Transactional
    public ExpenseDTO createExpense(ExpenseDTO dto) {
        if (dto.getCategoryId() == null) {
            throw new IllegalArgumentException("Category ID is required");
        }
        ExpenseCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Expense Category not found"));

        User user = userService.getCurrentUserEntity();

        Expense expense = new Expense();
        expense.setAmount(dto.getAmount());
        expense.setDescription(dto.getDescription());
        expense.setExpenseDate(dto.getExpenseDate());
        expense.setPaymentMethod(dto.getPaymentMethod());
        expense.setCategory(category);
        expense.setRecordedByUser(user);

        Expense saved = expenseRepository.save(expense);
        return mapToDTO(saved);
    }

    public List<ExpenseDTO> getAllExpenses() {
        return expenseRepository.findByOrderByExpenseDateDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ExpenseCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    private ExpenseDTO mapToDTO(Expense expense) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(expense.getId());
        dto.setAmount(expense.getAmount());
        dto.setDescription(expense.getDescription());
        dto.setExpenseDate(expense.getExpenseDate());
        dto.setPaymentMethod(expense.getPaymentMethod());
        dto.setCategoryId(expense.getCategory().getId());
        dto.setCategoryName(expense.getCategory().getName());
        dto.setRecordedByUserId(expense.getRecordedByUser().getId());
        dto.setRecordedByUserName(expense.getRecordedByUser().getFirstName() + " " + expense.getRecordedByUser().getLastName());
        return dto;
    }
}
