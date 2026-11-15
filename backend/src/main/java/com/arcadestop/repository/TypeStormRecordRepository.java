package com.arcadestop.repository;

import com.arcadestop.entity.TypeStormRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TypeStormRecordRepository extends JpaRepository<TypeStormRecord, Long> {

    Optional<TypeStormRecord> findByBrowserId(String browserId);

    boolean existsByBrowserId(String browserId);
}
