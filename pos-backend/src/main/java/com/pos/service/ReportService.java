package com.pos.service;

import com.pos.dto.report.DailySalesReport;
import com.pos.dto.report.TopProductReport;
import com.pos.entity.Order;
import com.pos.entity.PaymentStatus;
import com.pos.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;

    public DailySalesReport getDailySales(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();
        List<Order> orders = orderRepository.findByOrderDateBetween(start, end).stream()
                .filter(o -> o.getPaymentStatus() == PaymentStatus.COMPLETED)
                .collect(Collectors.toList());

        BigDecimal revenue = orders.stream().map(Order::getGrandTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal discount = orders.stream().map(Order::getDiscount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tax = orders.stream().map(Order::getTax).reduce(BigDecimal.ZERO, BigDecimal::add);

        return DailySalesReport.builder()
                .date(date)
                .totalOrders((long) orders.size())
                .totalRevenue(revenue)
                .totalDiscount(discount)
                .totalTax(tax)
                .build();
    }

    public BigDecimal getMonthlyRevenue(int year, int month) {
        LocalDateTime start = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime end = start.plusMonths(1);
        return orderRepository.sumRevenueBetween(start, end);
    }

    public List<TopProductReport> getTopProducts(LocalDate from, LocalDate to, int limit) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();
        return orderRepository.findTopSellingProducts(start, end).stream()
                .limit(limit)
                .map(row -> TopProductReport.builder()
                        .productId(((Number) row[0]).longValue())
                        .productName((String) row[1])
                        .totalQuantitySold(((Number) row[2]).longValue())
                        .build())
                .collect(Collectors.toList());
    }
}
