package com.arcadestop.repository;

import com.arcadestop.entity.SequenceMasterSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SequenceMasterSessionRepository extends JpaRepository<SequenceMasterSession, Long> {

    boolean existsBySessionId(String sessionId);

    List<SequenceMasterSession> findByBrowserIdOrderByCreatedAtDesc(String browserId);
}
