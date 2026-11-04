package com.arcadestop.repository;

import com.arcadestop.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {

    Optional<Game> findBySlug(String slug);

    List<Game> findByCategoryIgnoreCase(String category);

    boolean existsBySlug(String slug);

    List<Game> findAllByOrderByIdAsc();
}
