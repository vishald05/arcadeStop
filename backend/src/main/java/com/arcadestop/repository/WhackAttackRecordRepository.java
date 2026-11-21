package com.arcadestop.repository;

import com.arcadestop.entity.WhackAttackRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WhackAttackRecordRepository extends JpaRepository<WhackAttackRecord, Long> {

    Optional<WhackAttackRecord> findByBrowserId(String browserId);
}
