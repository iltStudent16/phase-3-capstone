import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api";
import type { Claim, PaginatedResponse, Policy } from "../types";

export default function ClaimsPage() {
  const [claims, setClaims] = useState<PaginatedResponse<Claim> | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ policy: "", description: "", incidentDate: "", amount: "" });

  async function loadData() {
    const [claimsRes, policiesRes] = await Promise.all([
      api.get<PaginatedResponse<Claim>>("/claims", { params: { page, limit: 8, status, search } }),
      api.get<PaginatedResponse<Policy>>("/policies", { params: { page: 1, limit: 100 } }),
    ]);
    setClaims(claimsRes.data);
    setPolicies(policiesRes.data.items);
  }

  useEffect(() => {
    loadData();
  }, [page, status, search]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post("/claims", {
      policy: form.policy,
      description: form.description,
      incidentDate: form.incidentDate,
      amount: Number(form.amount),
    });
    setForm({ policy: "", description: "", incidentDate: "", amount: "" });
    await loadData();
  }

  return (
    <div className="page-grid">
      <section className="card">
        <h2>New Claim</h2>
        <form className="inline-form" onSubmit={handleCreate}>
          <select required value={form.policy} onChange={(event) => setForm({ ...form, policy: event.target.value })}>
            <option value="">Select policy</option>
            {policies.map((policy) => <option key={policy._id} value={policy._id}>{policy.policyNumber}</option>)}
          </select>
          <input required placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <input required type="date" value={form.incidentDate} onChange={(event) => setForm({ ...form, incidentDate: event.target.value })} />
          <input required type="number" min="0" step="0.01" placeholder="Amount" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
          <button type="submit">Create</button>
        </form>
      </section>

      <section className="card">
        <h2>Claims</h2>
        <div className="filters">
          <input placeholder="Search claim # or description" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
          <select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}>
            <option value="">All statuses</option>
            <option value="submitted">submitted</option>
            <option value="under-review">under-review</option>
            <option value="approved">approved</option>
            <option value="denied">denied</option>
            <option value="closed">closed</option>
          </select>
        </div>
        <table className="table">
          <thead>
            <tr><th>Claim</th><th>Policy</th><th>Status</th><th>Amount</th><th /></tr>
          </thead>
          <tbody>
            {claims?.items.map((claim) => (
              <tr key={claim._id}>
                <td>{claim.claimNumber}</td>
                <td>{claim.policy.policyNumber}</td>
                <td><span className={`status-badge ${claim.status}`}>{claim.status}</span></td>
                <td>${claim.amount.toLocaleString()}</td>
                <td><Link to={`/claims/${claim._id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pager">
          <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
          <span>Page {claims?.page ?? 1} of {claims?.totalPages ?? 1}</span>
          <button disabled={!claims || page >= claims.totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      </section>
    </div>
  );
}
