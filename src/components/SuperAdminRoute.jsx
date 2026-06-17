import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function SuperAdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check if user is admin
      const { data, error } = await supabase
        .from('assinantes')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (data && data.is_admin) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    }

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0D1B2A', color: '#00B4D8' }}>
        Verificando permissões...
      </div>
    );
  }

  if (!isAdmin) {
    // If not admin, redirect to normal panel
    return <Navigate to="/painel" replace />;
  }

  return children;
}
