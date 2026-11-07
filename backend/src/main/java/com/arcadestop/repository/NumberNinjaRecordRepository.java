package com.arcadestop.repository;

import com.arcadestop.entity.NumberNinjaRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NumberNinjaRecordRepository extends JpaRepository<NumberNinjaRecord, Long> {
    Optional<NumberNinjaRecord> findByBrowserId(String browserId);
    boolean existsByBrowserId(String browserId);
}
