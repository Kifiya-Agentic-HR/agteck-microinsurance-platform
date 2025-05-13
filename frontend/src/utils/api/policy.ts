// src/lib/api/policy.ts

const API_BASE = 'http://localhost:8022/policies';

export interface Policy {
  id: number;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

// Fetch a list of policies
export async function listPolicies(skip = 0, limit = 10): Promise<Policy[]> {
  const res = await fetch(`${API_BASE}?skip=${skip}&limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch policies: ${res.statusText}`);
  return res.json();
}

// Update the status of a policy
export async function updatePolicyStatus(id: number, status: string): Promise<Policy> {
  const res = await fetch(`${API_BASE}/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update policy status: ${res.statusText}`);
  return res.json();
}

// Create a new policy
export async function createPolicy(data: { enrollment_id: number }): Promise<void> {
  const res = await fetch('http://localhost:8022/policies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create policy: ${errorText}`);
  }
}
