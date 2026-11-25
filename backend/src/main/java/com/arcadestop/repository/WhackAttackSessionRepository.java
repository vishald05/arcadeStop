package com.arcadestop.repository;

import com.arcadestop.entity.WhackAttackSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WhackAttackSessionRepository extends JpaRepository<WhackAttackSession, Long> {

    boolean existsBySessionId(String sessionId);

    List<WhackAttackSession> findByBrowserIdOrderByCreatedAtDesc(String browserId);

    Page<WhackAttackSession> findByBrowserId(String browserId, Pageable pageable);
}
