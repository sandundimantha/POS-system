package com.pos.service;

import com.pos.dto.product.ProductRequest;
import com.pos.dto.product.ProductResponse;
import com.pos.entity.Category;
import com.pos.entity.Product;
import com.pos.entity.Supplier;
import com.pos.exception.BadRequestException;
import com.pos.exception.ResourceNotFoundException;
import com.pos.repository.CategoryRepository;
import com.pos.repository.ProductRepository;
import com.pos.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final FileStorageService fileStorageService;

    @Cacheable(value = "products")
    public List<ProductResponse> findAll() {
        return productRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProductResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public ProductResponse findBySku(String sku) {
        return toResponse(productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "sku", sku)));
    }

    public List<ProductResponse> search(String query) {
        return productRepository.findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(query, query)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Cacheable(value = "lowStockProducts")
    public List<ProductResponse> findLowStock() {
        return productRepository.findLowStockProducts().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @CacheEvict(value = {"products", "lowStockProducts"}, allEntries = true)
    public ProductResponse create(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("Product with SKU '" + request.getSku() + "' already exists");
        }
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
        }
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .sku(request.getSku())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .minStockThreshold(request.getMinStockThreshold())
                .category(category)
                .supplier(supplier)
                .build();
        return toResponse(productRepository.save(product));
    }

    @CacheEvict(value = {"products", "lowStockProducts"}, allEntries = true)
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getOrThrow(id);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setMinStockThreshold(request.getMinStockThreshold());
        product.setCategory(category);
        return toResponse(productRepository.save(product));
    }

    @CacheEvict(value = {"products", "lowStockProducts"}, allEntries = true)
    public ProductResponse uploadImage(Long id, MultipartFile file) {
        Product product = getOrThrow(id);
        if (product.getImagePath() != null) {
            fileStorageService.deleteFile(product.getImagePath());
        }
        String fileName = fileStorageService.storeFile(file);
        product.setImagePath(fileName);
        return toResponse(productRepository.save(product));
    }

    @CacheEvict(value = {"products", "lowStockProducts"}, allEntries = true)
    public void delete(Long id) {
        Product product = getOrThrow(id);
        if (product.getImagePath() != null) {
            fileStorageService.deleteFile(product.getImagePath());
        }
        productRepository.delete(product);
    }

    public Product getOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    private ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId()).name(p.getName())
                .description(p.getDescription()).sku(p.getSku())
                .price(p.getPrice()).stockQuantity(p.getStockQuantity())
                .minStockThreshold(p.getMinStockThreshold())
                .imagePath(p.getImagePath())
                .categoryId(p.getCategory().getId())
                .categoryName(p.getCategory().getName())
                .supplierId(p.getSupplier() != null ? p.getSupplier().getId() : null)
                .supplierName(p.getSupplier() != null ? p.getSupplier().getName() : null)
                .createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt())
                .lowStock(p.getStockQuantity() <= p.getMinStockThreshold())
                .build();
    }
}
