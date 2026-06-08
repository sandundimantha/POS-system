package com.pos.service;

import com.pos.dto.order.*;
import com.pos.entity.*;
import com.pos.exception.BadRequestException;
import com.pos.exception.ResourceNotFoundException;
import com.pos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderResponse checkout(CheckoutRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User cashier = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));
        }

        List<OrderItem> items = new ArrayList<>();
        BigDecimal subTotal = BigDecimal.ZERO;

        for (CartItemRequest cartItem : request.getItems()) {
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", cartItem.getProductId()));
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName()
                        + ". Available: " + product.getStockQuantity());
            }
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subTotal = subTotal.add(itemTotal);

            items.add(OrderItem.builder()
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(product.getPrice())
                    .totalPrice(itemTotal)
                    .build());
        }

        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal taxableAmount = subTotal.subtract(discount);
        BigDecimal tax = taxableAmount.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = taxableAmount.add(tax);

        Order order = Order.builder()
                .invoiceNumber(generateInvoiceNumber())
                .cashier(cashier)
                .customer(customer)
                .subTotal(subTotal)
                .tax(tax)
                .discount(discount)
                .grandTotal(grandTotal)
                .paymentMode(request.getPaymentMode())
                .paymentStatus(PaymentStatus.COMPLETED)
                .orderItems(new ArrayList<>())
                .build();

        order = orderRepository.save(order);
        final Order savedOrder = order;
        items.forEach(item -> item.setOrder(savedOrder));
        savedOrder.getOrderItems().addAll(items);
        orderRepository.save(savedOrder);

        if (customer != null) {
            int points = grandTotal.intValue() / 10;
            customer.setLoyaltyPoints(customer.getLoyaltyPoints() + points);
            customerRepository.save(customer);
        }

        return toResponse(orderRepository.findById(savedOrder.getId()).orElseThrow());
    }

    public OrderResponse findById(Long id) {
        return toResponse(orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id)));
    }

    public OrderResponse findByInvoice(String invoiceNumber) {
        return toResponse(orderRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "invoiceNumber", invoiceNumber)));
    }

    public List<OrderResponse> findAll() {
        return orderRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> findByDateRange(LocalDateTime start, LocalDateTime end) {
        return orderRepository.findByOrderDateBetween(start, end).stream().map(this::toResponse).collect(Collectors.toList());
    }

    private String generateInvoiceNumber() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = orderRepository.count() + 1;
        return "INV-" + datePart + "-" + String.format("%04d", count);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(i -> OrderItemResponse.builder()
                        .id(i.getId())
                        .productId(i.getProduct().getId())
                        .productName(i.getProduct().getName())
                        .productSku(i.getProduct().getSku())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .totalPrice(i.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .invoiceNumber(order.getInvoiceNumber())
                .cashierName(order.getCashier().getUsername())
                .customerName(order.getCustomer() != null ? order.getCustomer().getName() : "Walk-in")
                .orderDate(order.getOrderDate())
                .subTotal(order.getSubTotal())
                .tax(order.getTax())
                .discount(order.getDiscount())
                .grandTotal(order.getGrandTotal())
                .paymentMode(order.getPaymentMode())
                .paymentStatus(order.getPaymentStatus())
                .items(itemResponses)
                .build();
    }
}
