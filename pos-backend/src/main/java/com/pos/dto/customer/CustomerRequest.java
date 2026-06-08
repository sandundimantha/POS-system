package com.pos.dto.customer;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerRequest {
    @NotBlank(message = "Customer name is required")
    private String name;
    private String email;
    private String phone;
    private String address;
}
