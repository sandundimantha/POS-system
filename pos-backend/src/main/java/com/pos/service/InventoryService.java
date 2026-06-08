package com.pos.service;

import com.pos.dto.inventory.StockAdjustmentRequest;
import com.pos.entity.InventoryTransaction;
import com.pos.entity.Product;
import com.pos.entity.TransactionType;
import com.pos.entity.User;
import com.pos.exception.BadRequestException;
import com.pos.repository.InventoryTransactionRepository;
import com.pos.repository.ProductRepository;
import com.pos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    @Transactional
    @CacheEvict(value = {"products", "lowStockProducts"}, allEntries = true)
    public InventoryTransaction adjustStock(StockAdjustmentRequest request) {
        Product product = productService.getOrThrow(request.getProductId());
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElse(null);

        if (request.getType() == TransactionType.STOCK_OUT) {
            if (product.getStockQuantity() < request.getQuantity()) {
                throw new BadRequestException("Insufficient stock. Available: " + product.getStockQuantity());
            }
            product.setStockQuantity(product.getStockQuantity() - request.getQuantity());
        } else {
            product.setStockQuantity(product.getStockQuantity() + request.getQuantity());
        }
        productRepository.save(product);

        return transactionRepository.save(InventoryTransaction.builder()
                .product(product)
                .type(request.getType())
                .quantity(request.getQuantity())
                .reason(request.getReason())
                .user(user)
                .build());
    }

    public List<InventoryTransaction> getHistory(Long productId) {
        return transactionRepository.findByProductId(productId);
    }
}
