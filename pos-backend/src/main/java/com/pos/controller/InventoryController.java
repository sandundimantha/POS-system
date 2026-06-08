package com.pos.controller;

import com.pos.dto.inventory.StockAdjustmentRequest;
import com.pos.entity.InventoryTransaction;
import com.pos.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Stock management APIs")
@SecurityRequirement(name = "bearerAuth")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/adjust")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Adjust stock (STOCK_IN or STOCK_OUT)")
    public ResponseEntity<InventoryTransaction> adjustStock(@Valid @RequestBody StockAdjustmentRequest request) {
        return ResponseEntity.ok(inventoryService.adjustStock(request));
    }

    @GetMapping("/history/{productId}")
    @Operation(summary = "Get stock history for a product")
    public ResponseEntity<List<InventoryTransaction>> getHistory(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getHistory(productId));
    }
}
