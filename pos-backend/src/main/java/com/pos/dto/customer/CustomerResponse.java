package com.pos.dto.customer;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CustomerResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private Integer loyaltyPoints;
    private LocalDateTime createdAt;
}
