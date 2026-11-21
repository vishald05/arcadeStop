package com.arcadestop.repository;

import com.arcadestop.entity.MemoryMadnessSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemoryMadnessSessionRepository extends JpaRepository<MemoryMadnessSession, Long> {

    boolean existsBySessionId(String sessionId);

    List<MemoryMadnessSession> findByBrowserIdOrderByCreatedAtDesc(String browserId);
}
