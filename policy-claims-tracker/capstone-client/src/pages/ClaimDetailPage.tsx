import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api";
import type { Claim } from "../types";

export default function ClaimDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [noteText, setNoteText] = useState("");

  async function loadClaim() {
    const { data } = await api.get<Claim>(`/claims/${id}`);
    setClaim(data);
  }

  useEffect(() => {
    if (id) {
      loadClaim();
    }
  }, [id]);

  async function updateStatus(status: Claim["status"]) {
    await api.put(`/claims/${id}`, { status });
    await loadClaim();
  }

  async function addNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post(`/claims/${id}/notes`, { text: noteText });
    setNoteText("");
    await loadClaim();
  }

  async function deleteClaim() {
    if (!window.confirm("Delete this claim?")) {
      return;
    }
    await api.delete(`/claims/${id}`);
    navigate("/claims");
  }

  if (!claim) {
    return <div className="card">Loading claim...</div>;
  }

  return (
    <div className="page-grid">
      <section className="card">
        <h2>{claim.claimNumber}</h2>
        <p>{claim.description}</p>
        <p>Policy: {claim.policy.policyNumber}</p>
        <p>Amount: ${claim.amount.toLocaleString()}</p>
        <div className="filters">
          <select value={claim.status} onChange={(event) => updateStatus(event.target.value as Claim["status"])}>
            <option value="submitted">submitted</option>
            <option value="under-review">under-review</option>
            <option value="approved">approved</option>
            <option value="denied">denied</option>
            <option value="closed">closed</option>
          </select>
          <button className="danger" onClick={deleteClaim}>Delete Claim</button>
        </div>
      </section>

      <section className="card">
        <h3>Notes</h3>
        <ul className="note-list">
          {claim.notes.map((note, index) => (
            <li key={`${note.createdAt}-${index}`}>
              <strong>{note.author?.name ?? "Unknown"}</strong>
              <p>{note.text}</p>
            </li>
          ))}
        </ul>
        <form className="inline-form" onSubmit={addNote}>
          <input value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Add note" required />
          <button type="submit">Add Note</button>
        </form>
      </section>
    </div>
  );
}
