import React from 'react';
import { getTileStyle } from './constants.js';

/**
 * Reusable dynamic grid component for Sequence Master.
 * Supports Easy (2x2), Medium (4x4), and Hard (6x6).
 */
export default function SequenceMasterGrid({
  gridSize = 2,
  activeTileIndex = null,
  selectedTileIndex = null,
  failedTileIndex = null,
  isLocked = false,
  onTileClick
}) {
  const totalTiles = gridSize * gridSize;

  return (
    <div
      className={`seqmaster-grid seqmaster-grid-${gridSize}`}
      role="grid"
      aria-label={`${gridSize} by ${gridSize} Sequence Master Grid`}
      style={{
        '--grid-size': gridSize
      }}
    >
      {Array.from({ length: totalTiles }).map((_, index) => {
        const isIlluminated = activeTileIndex === index;
        const isPressed = selectedTileIndex === index;
        const isFailed = failedTileIndex === index;
        const isActive = isIlluminated || isPressed;

        const tileStyle = getTileStyle(index, gridSize, isActive, isFailed);

        return (
          <button
            key={index}
            type="button"
            className={`seqmaster-tile ${isActive ? 'active' : ''} ${isFailed ? 'failed' : ''} ${isLocked ? 'locked' : ''}`}
            style={tileStyle}
            disabled={isLocked}
            onClick={() => {
              if (!isLocked && onTileClick) {
                onTileClick(index);
              }
            }}
            aria-label={`Tile ${index + 1}${isActive ? ' (illuminated)' : ''}`}
            tabIndex={isLocked ? -1 : 0}
          >
            <div className="seqmaster-tile-inner">
              <span className="seqmaster-tile-num">{index + 1}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
