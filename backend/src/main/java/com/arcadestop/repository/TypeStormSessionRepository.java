package com.arcadestop.repository;

import com.arcadestop.entity.TypeStormSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TypeStormSessionRepository extends JpaRepository<TypeStormSession, Long> {

    Optional<TypeStormSession> findBySessionId(String sessionId);

    boolean existsBySessionId(String sessionId);

    List<TypeStormSession> findByBrowserIdOrderByCreatedAtDesc(String browserId);

    Page<TypeStormSession> findByBrowserId(String browserId, Pageable pageable);
}
