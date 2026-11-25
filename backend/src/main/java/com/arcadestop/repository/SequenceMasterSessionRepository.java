package com.arcadestop.repository;

import com.arcadestop.entity.SequenceMasterSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SequenceMasterSessionRepository extends JpaRepository<SequenceMasterSession, Long> {

    boolean existsBySessionId(String sessionId);

    List<SequenceMasterSession> findByBrowserIdOrderByCreatedAtDesc(String browserId);

    Page<SequenceMasterSession> findByBrowserId(String browserId, Pageable pageable);

    Page<SequenceMasterSession> findByBrowserIdAndDifficulty(String browserId, String difficulty, Pageable pageable);
}
