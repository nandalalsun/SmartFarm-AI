package com.farmsmart.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "bill_staging_queue")
@Data
public class BillStaging {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "image_url")
    private String imageUrl; // In real app this would be S3 URL, for now maybe local path or base64?

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "extracted_json", columnDefinition = "jsonb")
    private String extractedJson; 

    @Column(name = "status")
    private String status; // PENDING, REVIEWED, DISCARDED

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "user_id")
    private UUID userId; 
}
