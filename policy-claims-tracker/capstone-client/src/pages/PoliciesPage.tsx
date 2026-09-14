import { useEffect, useState } from "react";

import api from "../api";
import type { PaginatedResponse, Policy } from "../types";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PaginatedResponse<Policy> | null>(null);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    policyNumber: "",
    holderName: "",
    type: "auto",
    premium: "",
    status: "active",
    effectiveDate: "",
    expirationDate: "",
  });

  async function loadPolicies() {
    const { data } = await api.get<PaginatedResponse<Policy>>("/policies", {
      params: { page, limit: 8, type, status, search },
    });
    setPolicies(data);
  }

  useEffect(() => {
    loadPolicies();
  }, [page, type, status, search]);

  async function createPolicy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post("/policies", { ...form, premium: Number(form.premium) });
    setForm({
      policyNumber: "",
      holderName: "",
      type: "auto",
      premium: "",
      status: "active",
      effectiveDate: "",
      expirationDate: "",
    });
    await loadPolicies();
  }

  async function deletePolicy(policyId: string) {
    await api.delete(`/policies/${policyId}`);
    await loadPolicies();
  }

  return (
    <div className="page-grid">
      <section className="card">
        <h2>New Policy</h2>
        <form className="inline-form" onSubmit={createPolicy}>
          <input required placeholder="Policy #" value={form.policyNumber} onChange={(event) => setForm({ ...form, policyNumber: event.target.value })} />
          <input required placeholder="Holder Name" value={form.holderName} onChange={(event) => setForm({ ...form, holderName: event.target.value })} />
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            <option value="auto">auto</option>
            <option value="home">home</option>
            <option value="life">life</option>
          </select>
          <input required type="number" min="0" step="0.01" placeholder="Premium" value={form.premium} onChange={(event) => setForm({ ...form, premium: event.target.value })} />
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="active">active</option>
            <option value="expired">expired</option>
            <option value="cancelled">cancelled</option>
          </select>
          <input required type="date" value={form.effectiveDate} onChange={(event) => setForm({ ...form, effectiveDate: event.target.value })} />
          <input required type="date" value={form.expirationDate} onChange={(event) => setForm({ ...form, expirationDate: event.target.value })} />
          <button type="submit">Create</button>
        </form>
      </section>

      <section className="card">
        <h2>Policies</h2>
        <div className="filters">
          <input placeholder="Search policy # or holder" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
          <select value={type} onChange={(event) => { setPage(1); setType(event.target.value); }}>
            <option value="">All types</option>
            <option value="auto">auto</option>
            <option value="home">home</option>
            <option value="life">life</option>
          </select>
          <select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}>
            <option value="">All statuses</option>
            <option value="active">active</option>
            <option value="expired">expired</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <table className="table">
          <thead>
            <tr><th>Policy</th><th>Holder</th><th>Type</th><th>Status</th><th /></tr>
          </thead>
          <tbody>
            {policies?.items.map((policy) => (
              <tr key={policy._id}>
                <td>{policy.policyNumber}</td>
                <td>{policy.holderName}</td>
                <td>{policy.type}</td>
                <td><span className={`status-badge ${policy.status}`}>{policy.status}</span></td>
                <td><button className="danger" onClick={() => deletePolicy(policy._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pager">
          <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
          <span>Page {policies?.page ?? 1} of {policies?.totalPages ?? 1}</span>
          <button disabled={!policies || page >= policies.totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      </section>
    </div>
  );
}
