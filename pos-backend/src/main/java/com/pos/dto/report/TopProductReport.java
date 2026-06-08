package com.pos.dto.report;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TopProductReport {
    private Long productId;
    private String productName;
    private Long totalQuantitySold;
}
