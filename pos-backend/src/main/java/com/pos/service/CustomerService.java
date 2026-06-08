package com.pos.service;

import com.pos.dto.customer.CustomerRequest;
import com.pos.dto.customer.CustomerResponse;
import com.pos.entity.Customer;
import com.pos.exception.ResourceNotFoundException;
import com.pos.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<CustomerResponse> findAll() {
        return customerRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CustomerResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public List<CustomerResponse> search(String query) {
        return customerRepository.findByNameContainingIgnoreCaseOrPhoneContaining(query, query)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CustomerResponse create(CustomerRequest request) {
        Customer customer = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .loyaltyPoints(0)
                .build();
        return toResponse(customerRepository.save(customer));
    }

    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = getOrThrow(id);
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        return toResponse(customerRepository.save(customer));
    }

    public void delete(Long id) {
        customerRepository.delete(getOrThrow(id));
    }

    private Customer getOrThrow(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
    }

    private CustomerResponse toResponse(Customer c) {
        return CustomerResponse.builder()
                .id(c.getId()).name(c.getName())
                .email(c.getEmail()).phone(c.getPhone())
                .address(c.getAddress())
                .loyaltyPoints(c.getLoyaltyPoints())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
