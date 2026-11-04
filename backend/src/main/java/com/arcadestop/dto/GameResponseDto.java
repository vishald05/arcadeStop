package com.arcadestop.dto;

import com.arcadestop.entity.Game;
import com.arcadestop.entity.GameStatus;
import java.time.LocalDateTime;

public class GameResponseDto {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String category;
    private String icon;
    private GameStatus status;
    private Boolean featured;
    private LocalDateTime createdAt;

    public GameResponseDto() {
    }

    public GameResponseDto(Long id, String name, String slug, String description, String category, String icon, GameStatus status, Boolean featured, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.category = category;
        this.icon = icon;
        this.status = status;
        this.featured = featured;
        this.createdAt = createdAt;
    }

    public static GameResponseDto fromEntity(Game game) {
        if (game == null) {
            return null;
        }
        return new GameResponseDto(
            game.getId(),
            game.getName(),
            game.getSlug(),
            game.getDescription(),
            game.getCategory(),
            game.getIcon(),
            game.getStatus(),
            game.getFeatured(),
            game.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public GameStatus getStatus() {
        return status;
    }

    public void setStatus(GameStatus status) {
        this.status = status;
    }

    public Boolean getFeatured() {
        return featured;
    }

    public void setFeatured(Boolean featured) {
        this.featured = featured;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
