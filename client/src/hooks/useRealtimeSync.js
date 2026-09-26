import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Subscribes to Supabase realtime changes for the specified tables.
 * When an INSERT, UPDATE, or DELETE is detected, it calls the provided callback.
 * 
 * @param {string[]} tables - Array of table names to listen to.
 * @param {Function} onUpdate - Callback function (usually fetching data).
 */
export default function useRealtimeSync(tables, onUpdate) {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!tables || tables.length === 0) return;

    // Unique channel name for this component instance
    const channelName = 'realtime_sync_' + Math.random().toString(36).substring(7);
    const channel = supabase.channel(channelName);

    tables.forEach(table => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: table },
        (payload) => {
          console.log(`[Realtime Sync] Change detected on ${table}`, payload.eventType);
          if (onUpdateRef.current) onUpdateRef.current();
        }
      );
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime Sync] Subscribed to ${tables.join(', ')}`);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tables.join(',')]);
}
