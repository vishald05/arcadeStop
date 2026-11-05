package com.arcadestop.repository;

import com.arcadestop.entity.ReactionRushRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReactionRushRecordRepository extends JpaRepository<ReactionRushRecord, Long> {
    Optional<ReactionRushRecord> findByBrowserId(String browserId);
    boolean existsByBrowserId(String browserId);
}
