package com.pos.service;

import com.pos.dto.supplier.SupplierRequest;
import com.pos.dto.supplier.SupplierResponse;
import com.pos.entity.Supplier;
import com.pos.exception.ResourceNotFoundException;
import com.pos.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<SupplierResponse> findAll() {
        return supplierRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SupplierResponse findById(Long id) {
        return toResponse(getSupplierOrThrow(id));
    }

    public SupplierResponse create(SupplierRequest request) {
        Supplier supplier = Supplier.builder()
                .name(request.getName())
                .contactPerson(request.getContactPerson())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .build();
        return toResponse(supplierRepository.save(supplier));
    }

    public SupplierResponse update(Long id, SupplierRequest request) {
        Supplier supplier = getSupplierOrThrow(id);
        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        return toResponse(supplierRepository.save(supplier));
    }

    public void delete(Long id) {
        supplierRepository.delete(getSupplierOrThrow(id));
    }

    private Supplier getSupplierOrThrow(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
    }

    private SupplierResponse toResponse(Supplier s) {
        return SupplierResponse.builder()
                .id(s.getId()).name(s.getName())
                .contactPerson(s.getContactPerson())
                .email(s.getEmail()).phone(s.getPhone())
                .address(s.getAddress()).createdAt(s.getCreatedAt())
                .build();
    }
}
