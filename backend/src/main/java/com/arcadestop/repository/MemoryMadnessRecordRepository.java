package com.arcadestop.repository;

import com.arcadestop.entity.MemoryMadnessRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemoryMadnessRecordRepository extends JpaRepository<MemoryMadnessRecord, Long> {

    Optional<MemoryMadnessRecord> findByBrowserIdAndDifficulty(String browserId, String difficulty);

    List<MemoryMadnessRecord> findByBrowserId(String browserId);
}
