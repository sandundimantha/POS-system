package com.pos.repository;

import com.pos.entity.Order;
import com.pos.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByInvoiceNumber(String invoiceNumber);
    List<Order> findByCashierId(Long cashierId);
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByOrderDateBetween(LocalDateTime start, LocalDateTime end);
    List<Order> findByPaymentStatus(PaymentStatus status);

    @Query("SELECT COALESCE(SUM(o.grandTotal), 0) FROM Order o WHERE o.orderDate BETWEEN :start AND :end AND o.paymentStatus = 'COMPLETED'")
    BigDecimal sumRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT oi.product.id, oi.product.name, SUM(oi.quantity) as totalQty FROM OrderItem oi " +
           "JOIN oi.order o WHERE o.orderDate BETWEEN :start AND :end AND o.paymentStatus = 'COMPLETED' " +
           "GROUP BY oi.product.id, oi.product.name ORDER BY totalQty DESC")
    List<Object[]> findTopSellingProducts(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
