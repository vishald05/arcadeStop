package com.arcadestop.repository;

import com.arcadestop.entity.SequenceMasterRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SequenceMasterRecordRepository extends JpaRepository<SequenceMasterRecord, Long> {

    Optional<SequenceMasterRecord> findByBrowserIdAndDifficulty(String browserId, String difficulty);

    List<SequenceMasterRecord> findByBrowserId(String browserId);
}
