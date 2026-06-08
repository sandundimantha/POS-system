package com.pos.dto.order;

import com.pos.entity.PaymentMode;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CheckoutRequest {
    @NotEmpty(message = "Cart cannot be empty")
    private List<CartItemRequest> items;

    @NotNull(message = "Payment mode is required")
    private PaymentMode paymentMode;

    private Long customerId;
    private BigDecimal discount = BigDecimal.ZERO;
}
