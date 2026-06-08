package com.pos.controller;

import com.pos.dto.report.DailySalesReport;
import com.pos.dto.report.TopProductReport;
import com.pos.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
@Tag(name = "Reports", description = "Analytics and reporting endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/daily")
    @Operation(summary = "Get daily sales report for a specific date")
    public ResponseEntity<DailySalesReport> getDailySales(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        return ResponseEntity.ok(reportService.getDailySales(date));
    }

    @GetMapping("/monthly")
    @Operation(summary = "Get total monthly revenue")
    public ResponseEntity<BigDecimal> getMonthlyRevenue(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(reportService.getMonthlyRevenue(year, month));
    }

    @GetMapping("/top-products")
    @Operation(summary = "Get top selling products in a date range")
    public ResponseEntity<List<TopProductReport>> getTopProducts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(reportService.getTopProducts(from, to, limit));
    }
}
