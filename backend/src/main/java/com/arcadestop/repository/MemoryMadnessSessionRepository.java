package com.arcadestop.repository;

import com.arcadestop.entity.MemoryMadnessSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemoryMadnessSessionRepository extends JpaRepository<MemoryMadnessSession, Long> {

    boolean existsBySessionId(String sessionId);

    List<MemoryMadnessSession> findByBrowserIdOrderByCreatedAtDesc(String browserId);

    Page<MemoryMadnessSession> findByBrowserId(String browserId, Pageable pageable);

    Page<MemoryMadnessSession> findByBrowserIdAndDifficulty(String browserId, String difficulty, Pageable pageable);
}
