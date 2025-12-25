package com.farmsmart.backend.dto;

import com.farmsmart.backend.entity.AdjustmentType;
import java.util.UUID;

public record StockAdjustmentDTO(
     UUID productId,
     Integer adjustmentQuantity,
     AdjustmentType adjustmentType,
     String reason,
     UUID adjustedByUserId) {}
