import { useState, useEffect, useCallback } from 'react';

interface TempoKeyData {
  bpm?: number | null;
  key_num?: number | null;
  mode?: number | null;
  key_str?: string | null;
  source?: string;
  confidence?: number;
  flags?: Record<string, boolean>;
  hasOverride?: boolean;
}

interface UseTempoKeyOptions {
  spotifyId: string;
  autoResolve?: boolean;
}

export function useTempoKey({ spotifyId, autoResolve = true }: UseTempoKeyOptions) {
  const [data, setData] = useState<TempoKeyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveTempoKey = useCallback(async () => {
    if (!spotifyId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/qc/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotifyId })
      });

      if (!response.ok) {
        throw new Error('Failed to resolve tempo/key');
      }

      const result = await response.json();
      setData({
        ...result,
        hasOverride: result.source === 'user'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [spotifyId]);

  const updateOverride = useCallback(async (updateData: {
    bpm?: number;
    key_num?: number;
    mode?: number;
    reason: string;
  }) => {
    if (!spotifyId) return;

    try {
      const response = await fetch('/api/qc/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotifyId, ...updateData })
      });

      if (!response.ok) {
        throw new Error('Failed to update override');
      }

      const result = await response.json();
      
      // Update local state
      setData(prev => ({
        ...prev,
        ...updateData,
        key_str: result.key_str,
        source: 'user',
        confidence: 1.0,
        flags: { user_verified: true },
        hasOverride: true
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update override');
    }
  }, [spotifyId]);

  const clearOverride = useCallback(async () => {
    if (!spotifyId) return;

    try {
      const response = await fetch('/api/qc/override', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotifyId })
      });

      if (!response.ok) {
        throw new Error('Failed to clear override');
      }

      // Re-resolve to get the original data
      await resolveTempoKey();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear override');
    }
  }, [spotifyId, resolveTempoKey]);

  useEffect(() => {
    if (autoResolve && spotifyId) {
      resolveTempoKey();
    }
  }, [spotifyId, autoResolve, resolveTempoKey]);

  return {
    data,
    loading,
    error,
    resolveTempoKey,
    updateOverride,
    clearOverride
  };
}
