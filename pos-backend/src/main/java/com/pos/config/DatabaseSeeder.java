package com.pos.config;

import com.pos.entity.*;
import com.pos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Clear old database records to ensure a fresh 30-product sample setup
        orderRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        supplierRepository.deleteAll();
        customerRepository.deleteAll();
        System.out.println("DATABASE CLEANED: Cleared old records for fresh seed.");

        // 1. Seed Users
        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .email("admin@pos.com")
                    .role(Role.ROLE_ADMIN)
                    .active(true)
                    .build());
        }

        if (!userRepository.existsByUsername("manager")) {
            userRepository.save(User.builder()
                    .username("manager")
                    .password(passwordEncoder.encode("manager123"))
                    .email("manager@pos.com")
                    .role(Role.ROLE_MANAGER)
                    .active(true)
                    .build());
        }

        if (!userRepository.existsByUsername("cashier")) {
            userRepository.save(User.builder()
                    .username("cashier")
                    .password(passwordEncoder.encode("cashier123"))
                    .email("cashier@pos.com")
                    .role(Role.ROLE_CASHIER)
                    .active(true)
                    .build());
        }
        System.out.println("DATABASE SEEDED: Staff Accounts Verified");

        // 2. Seed Categories
        Category beverages = getOrCreateCategory("Beverages", "Drinks, Sodas, and Juices");
        Category snacks = getOrCreateCategory("Snacks", "Chips, Crackers, and Chocolates");
        Category electronics = getOrCreateCategory("Electronics", "Devices and Accessories");
        Category groceries = getOrCreateCategory("Groceries", "Daily essential food items");
        Category bakery = getOrCreateCategory("Bakery", "Fresh bread and pastries");
        Category clothing = getOrCreateCategory("Clothing", "Apparel and garments");
        Category fitness = getOrCreateCategory("Fitness", "Sports and exercise equipment");
        Category office = getOrCreateCategory("Office", "Stationery and desk accessories");

        // 3. Seed Suppliers
        Supplier globalFoods = getOrCreateSupplier("Global Foods Ltd", "Alice Johnson", "alice@globalfoods.com", "+1234567890", "123 Food Street, NY");
        Supplier superTech = getOrCreateSupplier("SuperTech Distributors", "Bob Smith", "bob@supertech.com", "+1987654321", "456 Tech Ave, CA");
        Supplier apparelSupply = getOrCreateSupplier("Apparel Direct Co", "Charlie Rose", "charlie@appareldirect.com", "+1444555666", "789 Fashion Way, TX");
        Supplier officeCorp = getOrCreateSupplier("OfficeCorp Supplies", "Diana Prince", "diana@officecorp.com", "+1777888999", "101 Paper Road, WA");

        // 4. Seed Products (30 Products)
        // Beverages
        createProduct("Coca Cola 500ml", "Refreshing carbonated soft drink", "BEV001", 1.50, 100, 10, "beverage.jpg", beverages, globalFoods);
        createProduct("Pepsi 500ml", "Carbonated cola soft drink", "BEV002", 1.40, 120, 10, "beverage.jpg", beverages, globalFoods);
        createProduct("Orange Juice 1L", "100% pure squeezed orange juice", "BEV003", 3.00, 40, 5, "beverage.jpg", beverages, globalFoods);
        createProduct("Green Tea Bottle", "Unsweetened organic green tea", "BEV004", 1.80, 60, 8, "beverage.jpg", beverages, globalFoods);
        createProduct("Energy Drink", "High caffeine energy booster", "BEV005", 2.50, 80, 10, "beverage.jpg", beverages, globalFoods);

        // Snacks
        createProduct("Potato Chips Lays", "Classic salted potato chips", "SNA001", 2.00, 50, 10, "snack.jpg", snacks, globalFoods);
        createProduct("Chocolate Bar", "Premium milk chocolate bar", "SNA002", 1.50, 150, 15, "snack.jpg", snacks, globalFoods);
        createProduct("Salted Peanuts", "Roasted and salted peanuts", "SNA003", 2.20, 75, 8, "snack.jpg", snacks, globalFoods);
        createProduct("Gummy Bears", "Fruit flavored gummy candies", "SNA004", 1.80, 90, 10, "snack.jpg", snacks, globalFoods);
        createProduct("Chocolate Chip Cookie", "Freshly baked cookie packet", "SNA005", 2.50, 45, 5, "snack.jpg", snacks, globalFoods);

        // Electronics
        createProduct("Wireless Mouse", "Ergonomic 2.4GHz wireless mouse", "ELE001", 15.00, 25, 5, "electronic.jpg", electronics, superTech);
        createProduct("USB-C Cable 1m", "Fast charging USB-C to USB-C cable", "ELE002", 8.00, 100, 15, "electronic.jpg", electronics, superTech);
        createProduct("Bluetooth Earbuds", "Wireless in-ear stereo earbuds", "ELE003", 29.99, 15, 3, "electronic.jpg", electronics, superTech);
        createProduct("Power Bank 10000mAh", "Portable external battery pack", "ELE004", 19.99, 30, 5, "electronic.jpg", electronics, superTech);
        createProduct("Laptop Stand", "Adjustable aluminum laptop riser", "ELE005", 24.50, 12, 3, "electronic.jpg", electronics, superTech);

        // Groceries
        createProduct("Whole Milk 1L", "Fresh pasteurized whole milk", "GRO001", 1.20, 4, 10, "groceries.jpg", groceries, globalFoods); // Low Stock
        createProduct("Fresh Eggs 12pk", "Grade A large farm fresh eggs", "GRO002", 3.50, 30, 8, "groceries.jpg", groceries, globalFoods);
        createProduct("White Rice 2kg", "Long grain premium white rice", "GRO003", 4.99, 40, 5, "groceries.jpg", groceries, globalFoods);
        createProduct("Olive Oil 500ml", "Extra virgin cold pressed olive oil", "GRO004", 7.50, 15, 4, "groceries.jpg", groceries, globalFoods);
        createProduct("Pasta 500g", "Durum wheat semolina penne pasta", "GRO005", 1.10, 80, 10, "groceries.jpg", groceries, globalFoods);

        // Bakery
        createProduct("Sliced White Bread", "Freshly baked sandwich bread", "BAK001", 1.80, 6, 10, "bakery.jpg", bakery, globalFoods); // Low Stock
        createProduct("Butter Croissant", "Flaky and buttery french pastry", "BAK002", 2.20, 25, 5, "bakery.jpg", bakery, globalFoods);
        createProduct("Blueberry Muffin", "Baked muffin loaded with blueberries", "BAK003", 2.50, 18, 5, "bakery.jpg", bakery, globalFoods);

        // Clothing
        createProduct("Cotton T-Shirt L", "100% combed cotton black t-shirt", "CLO001", 12.99, 50, 8, "clothing.jpg", clothing, apparelSupply);
        createProduct("Denim Jeans 32", "Classic slim fit blue denim jeans", "CLO002", 39.99, 20, 4, "clothing.jpg", clothing, apparelSupply);

        // Fitness
        createProduct("Yoga Mat 6mm", "Non-slip eco-friendly exercise mat", "FIT001", 18.50, 15, 3, "fitness.jpg", fitness, superTech);
        createProduct("Water Bottle 750ml", "Stainless steel vacuum insulated bottle", "FIT002", 9.99, 35, 5, "fitness.jpg", fitness, superTech);

        // Office
        createProduct("Gel Pen Black 12pk", "Smooth writing black gel ink pens", "OFF001", 5.49, 60, 10, "office.jpg", office, officeCorp);
        createProduct("A4 Copy Paper 500s", "High brightness A4 printing paper", "OFF002", 6.99, 45, 8, "office.jpg", office, officeCorp);
        createProduct("Sticky Notes 3x3", "Yellow self-stick notes 100 sheets", "OFF003", 2.99, 80, 15, "office.jpg", office, officeCorp);

        System.out.println("DATABASE SEEDED: Created 30 Products");

        // 5. Seed Customers (10 Customers)
        createCustomer("John Doe", "john@gmail.com", "1234567890", "789 Maple St, Boston", 120);
        createCustomer("Jane Smith", "jane@gmail.com", "0987654321", "321 Oak Rd, Seattle", 50);
        createCustomer("Robert Downey", "robert@stark.com", "1112223333", "Stark Tower, NYC", 450);
        createCustomer("Bruce Wayne", "bruce@wayne.com", "9998887777", "Wayne Manor, Gotham", 1000);
        createCustomer("Diana Prince", "diana@themyscira.gov", "5554443333", "Amazon Embassy, DC", 250);
        createCustomer("Peter Parker", "peter@dailybugle.com", "4445556666", "Queens, NY", 15);
        createCustomer("Clark Kent", "clark@dailyplanet.com", "7776665555", "Metropolis", 80);
        createCustomer("Barry Allen", "barry@ccpd.gov", "3332221111", "Central City", 95);
        createCustomer("Tony Stark", "tony@stark.com", "8885551111", "Malibu, CA", 900);
        createCustomer("Natasha Romanoff", "natasha@shield.gov", "2229994444", "Secret Location", 320);
        System.out.println("DATABASE SEEDED: Created 10 Customers");
    }

    private Category getOrCreateCategory(String name, String description) {
        return categoryRepository.findByName(name)
                .orElseGet(() -> categoryRepository.save(Category.builder().name(name).description(description).build()));
    }

    private Supplier getOrCreateSupplier(String name, String contact, String email, String phone, String address) {
        return supplierRepository.findAll().stream()
                .filter(s -> s.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> supplierRepository.save(Supplier.builder()
                        .name(name)
                        .contactPerson(contact)
                        .email(email)
                        .phone(phone)
                        .address(address)
                        .build()));
    }

    private void createProduct(String name, String description, String sku, double price, int stock, int threshold, String image, Category category, Supplier supplier) {
        if (!productRepository.findBySku(sku).isPresent()) {
            productRepository.save(Product.builder()
                    .name(name)
                    .description(description)
                    .sku(sku)
                    .price(BigDecimal.valueOf(price))
                    .stockQuantity(stock)
                    .minStockThreshold(threshold)
                    .imagePath(image)
                    .category(category)
                    .supplier(supplier)
                    .build());
        }
    }

    private void createCustomer(String name, String email, String phone, String address, int points) {
        customerRepository.save(Customer.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .address(address)
                .loyaltyPoints(points)
                .build());
    }
}
