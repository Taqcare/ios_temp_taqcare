
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase com SERVICE_ROLE_KEY para operações admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Criar cliente normal para verificar autenticação
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verificar se o usuário está autenticado
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const userId = user.id;
    console.log('Iniciando exclusão completa da conta para usuário:', userId);

    // 1. Buscar e excluir fotos do storage específicas do usuário
    console.log('Buscando e excluindo fotos do usuário...');
    const { data: photos, error: photosError } = await supabaseAdmin
      .from('progress_photos')
      .select('storage_path')
      .eq('user_id', userId);
      
    if (photos && photos.length > 0) {
      console.log(`Encontradas ${photos.length} fotos para exclusão`);
      const filePaths = photos.map(photo => photo.storage_path);
      const { error: storageError } = await supabaseAdmin
        .storage
        .from('progress_photos')
        .remove(filePaths);
        
      if (storageError) {
        console.error('Erro ao excluir fotos do storage:', storageError);
      } else {
        console.log('Fotos excluídas do storage com sucesso');
      }
    }
    
    // 2. Excluir dados das tabelas relacionadas APENAS do usuário específico
    console.log('Excluindo dados das tabelas relacionadas...');
    
    // Excluir fotos de progresso apenas do usuário
    const { error: deletePhotosError } = await supabaseAdmin
      .from('progress_photos')
      .delete()
      .eq('user_id', userId);
    
    if (deletePhotosError) {
      console.error('Erro ao excluir progress_photos:', deletePhotosError);
    }
    
    // Excluir sessões de tratamento apenas do usuário
    const { error: deleteSessionsError } = await supabaseAdmin
      .from('treatment_sessions')
      .delete()
      .eq('user_id', userId);
    
    if (deleteSessionsError) {
      console.error('Erro ao excluir treatment_sessions:', deleteSessionsError);
    }
    
    // Excluir preferências apenas do usuário
    const { error: deletePreferencesError } = await supabaseAdmin
      .from('user_preferences')
      .delete()
      .eq('user_id', userId);
    
    if (deletePreferencesError) {
      console.error('Erro ao excluir user_preferences:', deletePreferencesError);
    }
    
    // Excluir perfil apenas do usuário
    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (deleteProfileError) {
      console.error('Erro ao excluir profile:', deleteProfileError);
    }
    
    // 3. FINALMENTE: Excluir o usuário do sistema de autenticação
    console.log('Excluindo usuário do sistema de autenticação...');
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteAuthError) {
      console.error('Erro ao excluir usuário da autenticação:', deleteAuthError);
      throw new Error(`Falha ao excluir usuário da autenticação: ${deleteAuthError.message}`);
    }
    
    console.log('Usuário excluído completamente do sistema!');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Conta excluída completamente com sucesso' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Erro na edge function delete-user-account:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
