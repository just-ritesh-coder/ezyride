import React, { useState } from 'react';

const RideStatusUpdate = ({ rideId, initialStatus }) => {
  const [status, setStatus] = useState(initialStatus || 'posted');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const updateStatus = async (newStatus) => {
    setErr('');
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/rides/${rideId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      setStatus(data.ride.status);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const canStart = status === 'posted';
  const canComplete = status === 'ongoing';

  return (
    <div>
      <p>Status: {status}</p>
      {err && <p style={{ color: 'red' }}>{err}</p>}

      <button disabled={!canStart || loading} onClick={() => updateStatus('ongoing')}>
        Start Ride
      </button>

      <button disabled={!canComplete || loading} onClick={() => updateStatus('completed')}>
        Complete Ride
      </button>

      {loading && <p>Updating...</p>}
    </div>
  );
};

export default RideStatusUpdate;
