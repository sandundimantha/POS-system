package com.pos.dto.product;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private String sku;
    private BigDecimal price;
    private Integer stockQuantity;
    private Integer minStockThreshold;
    private String imagePath;
    private String categoryName;
    private Long categoryId;
    private String supplierName;
    private Long supplierId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean lowStock;
}
