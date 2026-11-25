import React from 'react';
import { Trophy, RotateCw, ShieldCheck } from 'lucide-react';

export default function DashboardHeader({ onRefresh, isRefreshing }) {
  return (
    <header className="records-header">
      <div className="records-header-main">
        <div className="records-trophy-badge" aria-hidden="true">
          <Trophy size={28} className="trophy-icon" strokeWidth={2.2} />
        </div>
        <div className="records-header-text">
          <div className="records-tag-row">
            <span className="records-badge">
              <ShieldCheck size={13} strokeWidth={2.5} />
              <span>LOCAL VAULT ACTIVE</span>
            </span>
          </div>
          <h1 className="records-dashboard-title">YOUR ARCADE RECORDS</h1>
          <p className="records-dashboard-subtitle">
            Your progress. Your records. Your next challenge.
          </p>
        </div>
      </div>

      <div className="records-header-actions">
        <button
          type="button"
          className={`records-refresh-btn ${isRefreshing ? 'is-refreshing' : ''}`}
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh arcade records"
          title="Refresh latest statistics"
        >
          <RotateCw size={16} className={`refresh-icon ${isRefreshing ? 'spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Records'}</span>
        </button>
      </div>
    </header>
  );
}
