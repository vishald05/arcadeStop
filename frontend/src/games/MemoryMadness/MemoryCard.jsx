import React from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Reusable 3D Flip Memory Card Component.
 */
export default function MemoryCard({
  card,
  isFlipped = false,
  isMatched = false,
  isMismatch = false,
  isDisabled = false,
  onCardClick
}) {
  const IconComponent = card.icon;

  const handleClick = () => {
    if (!isFlipped && !isMatched && !isDisabled && onCardClick) {
      onCardClick(card);
    }
  };

  return (
    <div
      className={`memcard-wrapper ${isFlipped || isMatched ? 'flipped' : ''} ${isMatched ? 'matched' : ''} ${isMismatch ? 'mismatched' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={isMatched || isDisabled ? -1 : 0}
      aria-label={isFlipped || isMatched ? `Card ${card.name}` : 'Face down card'}
      aria-disabled={isMatched || isDisabled}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="memcard-inner">
        {/* Card Back (Face Down) */}
        <div className="memcard-face memcard-back">
          <div className="memcard-back-pattern" />
          <div className="memcard-back-icon">
            <HelpCircle size={22} strokeWidth={2.4} />
          </div>
        </div>

        {/* Card Front (Face Up / Revealed) */}
        <div
          className="memcard-face memcard-front"
          style={{
            '--card-theme': card.color
          }}
        >
          <div className="memcard-front-glow" />
          {IconComponent && (
            <div className="memcard-symbol-wrapper">
              <IconComponent size={28} strokeWidth={2.4} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
