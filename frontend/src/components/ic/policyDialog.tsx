'use client';

import React, { useState } from 'react';

interface CreatePolicyDialogProps {
  onClose: () => void;
}

export default function CreatePolicyDialog({ onClose }: CreatePolicyDialogProps) {
  const [policyName, setPolicyName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverage, setCoverage] = useState('');
  const [premium, setPremium] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add logic to create policy
    console.log({ policyName, startDate, endDate, coverage, premium });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Policy Name"
        value={policyName}
        onChange={(e) => setPolicyName(e.target.value)}
        required
      />
      <input
        type="date"
        placeholder="Start Date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
      />
      <input
        type="date"
        placeholder="End Date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Coverage"
        value={coverage}
        onChange={(e) => setCoverage(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Premium"
        value={premium}
        onChange={(e) => setPremium(e.target.value)}
        required
      />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        Create Policy
      </button>
      <button type="button" onClick={onClose} className="text-red-500 underline">
        Cancel
      </button>
    </form>
  );
}