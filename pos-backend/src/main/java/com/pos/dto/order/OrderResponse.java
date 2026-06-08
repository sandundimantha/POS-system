package com.pos.dto.order;

import com.pos.entity.PaymentMode;
import com.pos.entity.PaymentStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private String invoiceNumber;
    private String cashierName;
    private String customerName;
    private LocalDateTime orderDate;
    private BigDecimal subTotal;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal grandTotal;
    private PaymentMode paymentMode;
    private PaymentStatus paymentStatus;
    private List<OrderItemResponse> items;
}
