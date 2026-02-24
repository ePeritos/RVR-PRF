import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const HEARTBEAT_INTERVAL = 15000; // 15 seconds

export const useEditLock = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const lockedRecordRef = useRef<string | null>(null);

  const acquireLock = useCallback(async (recordId: string): Promise<boolean> => {
    if (!user) return false;

    const { data, error } = await supabase.rpc('acquire_edit_lock', {
      p_record_id: recordId,
      p_user_id: user.id,
    });

    if (error) {
      console.error('Erro ao adquirir lock:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível verificar o bloqueio de edição.',
        variant: 'destructive',
      });
      return false;
    }

    const result = data as unknown as { success: boolean; locked_by?: string; locked_at?: string };

    if (!result.success) {
      toast({
        title: 'Registro em edição',
        description: `Este registro está sendo editado por "${result.locked_by}". Tente novamente em alguns instantes.`,
        variant: 'destructive',
      });
      return false;
    }

    // Start heartbeat
    lockedRecordRef.current = recordId;
    heartbeatRef.current = setInterval(async () => {
      if (!user) return;
      await supabase.rpc('refresh_edit_lock', {
        p_record_id: recordId,
        p_user_id: user.id,
      });
    }, HEARTBEAT_INTERVAL);

    return true;
  }, [user, toast]);

  const releaseLock = useCallback(async (recordId?: string) => {
    const id = recordId || lockedRecordRef.current;
    if (!id || !user) return;

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    await supabase.rpc('release_edit_lock', {
      p_record_id: id,
      p_user_id: user.id,
    });

    lockedRecordRef.current = null;
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      if (lockedRecordRef.current && user) {
        supabase.rpc('release_edit_lock', {
          p_record_id: lockedRecordRef.current,
          p_user_id: user.id,
        });
      }
    };
  }, [user]);

  // Release on page unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (lockedRecordRef.current && user) {
        // Best effort release - sendBeacon doesn't support auth headers,
        // so use fetch with keepalive
        try {
          fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/release_edit_lock`, {
            method: 'POST',
            keepalive: true,
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
            body: JSON.stringify({
              p_record_id: lockedRecordRef.current,
              p_user_id: user.id,
            }),
          });
        } catch {
          // Best effort - lock will expire via heartbeat anyway
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  return { acquireLock, releaseLock };
};
