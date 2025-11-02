import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// URL do webhook do n8n
const N8N_WEBHOOK_URL = 'https://area-n8n-n8n.ehqlcr.easypanel.host/webhook/eeb1e281-9bd8-4af3-a1ca-4b95976f15b4';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, user_id, user_name, user_email, user_phone, image } = await req.json();
    
    console.log('Support chat request:', { message, user_id, user_name, user_email, user_phone, has_image: !!image });
    
    if (!user_id || (!message && !image)) {
      throw new Error('ID do usuário é obrigatório e deve ter mensagem ou imagem');
    }

    // Envia a mensagem para o n8n
    console.log('Sending message to n8n webhook...');
    
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        user_id,
        user_name: user_name || null,
        user_email: user_email || null,
        user_phone: user_phone || null,
        image: image || null,
        timestamp: new Date().toISOString(),
        source: 'taqcare_support_chat'
      })
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n webhook error: ${n8nResponse.status} ${n8nResponse.statusText}`);
    }

    // Tenta processar a resposta JSON do n8n de forma segura
    let n8nData = {};
    try {
      const responseText = await n8nResponse.text();
      console.log('n8n raw response:', responseText);
      
      if (responseText.trim()) {
        n8nData = JSON.parse(responseText);
      } else {
        console.log('n8n returned empty response');
        n8nData = {};
      }
    } catch (parseError) {
      console.error('Error parsing n8n response:', parseError);
      n8nData = {};
    }
    
    console.log('n8n parsed data:', n8nData);

    // Extrai a resposta do n8n
    let response = '';
    
    // Tenta extrair a resposta de diferentes estruturas possíveis do n8n
    if (n8nData.output) {
      response = n8nData.output;
    } else if (n8nData.response) {
      response = n8nData.response;
    } else if (n8nData.message) {
      response = n8nData.message;
    } else {
      // Se n8nData é um objeto complexo, procura pelo campo 'output' em estruturas aninhadas
      const findOutput = (obj) => {
        if (typeof obj !== 'object' || obj === null) return null;
        
        if (obj.output) return obj.output;
        
        for (const key in obj) {
          if (Array.isArray(obj[key])) {
            for (const item of obj[key]) {
              if (item && item.output) return item.output;
            }
          } else if (typeof obj[key] === 'object') {
            const result = findOutput(obj[key]);
            if (result) return result;
          }
        }
        return null;
      };
      
      response = findOutput(n8nData) || '';
    }
    
    // Filtra mensagens automáticas do sistema
    if (response === 'Workflow was started') {
      response = '';
    }
    
    // Se não há resposta válida, usa mensagem de fallback
    if (!response.trim()) {
      response = 'Ops, Tive um probleminha aqui, tente novamente.';
    }

    // Log da conversa para análise futura
    console.log('Chat log:', {
      user_id,
      user_name,
      user_email,
      user_phone,
      message,
      response,
      has_image: !!image,
      n8n_data: n8nData,
      timestamp: new Date().toISOString()
    });

    // Notifica o frontend sobre a nova mensagem via postMessage
    return new Response(
      JSON.stringify({ 
        response,
        timestamp: new Date().toISOString(),
        // Script para notificar o frontend
        notification: `
          <script>
            setTimeout(() => {
              if (window.addSupportMessage) {
                window.addSupportMessage('${response.replace(/'/g, "\\'")}');
              }
              window.postMessage({
                type: 'SUPPORT_MESSAGE',
                message: '${response.replace(/'/g, "\\'")}'
              }, '*');
            }, 1000);
          </script>
        `
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in support chat:', error);
    
    // Resposta de fallback quando o n8n não responde
    const fallbackResponse = 'Desculpe, estou com problemas técnicos no momento. Para suporte imediato, entre em contato pelo WhatsApp: (11) 99999-9999 ou email: suporte@taqcare.com.br';
    
    return new Response(
      JSON.stringify({ 
        response: fallbackResponse,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
