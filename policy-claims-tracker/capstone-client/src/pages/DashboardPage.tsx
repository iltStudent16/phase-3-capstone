import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api";
import type { DashboardStats } from "../types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.get<DashboardStats>("/dashboard").then((response) => setStats(response.data));
  }, []);

  const maxStatusCount = useMemo(() => {
    if (!stats?.claimsByStatus.length) {
      return 1;
    }
    return Math.max(...stats.claimsByStatus.map((item) => item.count));
  }, [stats]);

  if (!stats) {
    return <div className="card">Loading dashboard...</div>;
  }

  return (
    <div className="page-grid">
      <section className="stats-grid">
        <article className="card stat-card"><h3>Total Claims</h3><p>{stats.totalClaims}</p></article>
        <article className="card stat-card"><h3>Total Policies</h3><p>{stats.totalPolicies}</p></article>
        <article className="card stat-card"><h3>Total Users</h3><p>{stats.totalUsers}</p></article>
        <article className="card stat-card"><h3>Claim Amount</h3><p>${stats.totalClaimAmount.toLocaleString()}</p></article>
      </section>

      <section className="card">
        <h2>Claims by Status</h2>
        <div className="status-bars">
          {stats.claimsByStatus.map((item) => (
            <div key={item._id} className="status-row">
              <span>{item._id}</span>
              <div className="bar-wrap">
                <div className="bar" style={{ width: `${(item.count / maxStatusCount) * 100}%` }} />
              </div>
              <strong>{item.count}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Recent Claims</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Claim #</th>
              <th>Policy</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentClaims.map((claim) => (
              <tr key={claim._id}>
                <td><Link to={`/claims/${claim._id}`}>{claim.claimNumber}</Link></td>
                <td>{claim.policy.policyNumber}</td>
                <td><span className={`status-badge ${claim.status}`}>{claim.status}</span></td>
                <td>${claim.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
