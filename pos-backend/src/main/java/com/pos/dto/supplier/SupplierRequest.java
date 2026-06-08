package com.pos.dto.supplier;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupplierRequest {
    @NotBlank(message = "Supplier name is required")
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
}
