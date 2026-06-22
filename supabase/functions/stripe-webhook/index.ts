import Stripe from 'npm:stripe@^14.0.0';
import { createClient } from 'npm:@supabase/supabase-js@^2.39.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

// ── Email de Upsell: Start → VIP ──
async function sendVipUpsellEmail(email: string, nomeEmpresa: string) {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) {
    console.warn('RESEND_API_KEY não configurada. Email de upsell não enviado.');
    return;
  }

  const htmlContent = '<!DOCTYPE html>\\n' +
'<html>\\n' +
'<head><meta charset="utf-8"></head>\\n' +
'<body style="margin:0;padding:0;font-family:\\'Segoe UI\\',Roboto,sans-serif;background-color:#0D1B2A;color:#F8F9FA;">\\n' +
'  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">\\n' +
'    <div style="text-align:center;margin-bottom:32px;">\\n' +
'      <h1 style="font-size:28px;margin:0;color:#00B4D8;">LavaZap</h1>\\n' +
'      <p style="color:#A0B2C6;font-size:14px;margin-top:4px;">Parabéns pela sua assinatura! 🎉</p>\\n' +
'    </div>\\n' +
'    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;margin-bottom:24px;">\\n' +
'      <h2 style="font-size:22px;margin:0 0 16px 0;color:#F8F9FA;">\\n' +
'        ' + (nomeEmpresa ? nomeEmpresa + ', você' : 'Você') + ' sabia que pode colocar seu WhatsApp no <span style="color:#00B4D8;">Piloto Automático</span>?\\n' +
'      </h2>\\n' +
'      <p style="color:#A0B2C6;font-size:15px;line-height:1.7;margin:0 0 24px 0;">\\n' +
'        Com o seu <strong style="color:#F8F9FA;">Plano Start</strong> você já organiza sua agenda como um profissional. \\n' +
'        Mas imagine se o seu WhatsApp <strong style="color:#F8F9FA;">respondesse sozinho</strong>, agendasse lavagens de madrugada \\n' +
'        e lotasse sua agenda sem você precisar digitar uma única palavra?\\n' +
'      </p>\\n' +
'      <div style="background:rgba(0,180,216,0.08);border:1px solid rgba(0,180,216,0.2);border-radius:12px;padding:20px;margin-bottom:24px;">\\n' +
'        <h3 style="color:#00B4D8;font-size:16px;margin:0 0 12px 0;">🤖 Plano IA VIP — R$ 297/mês</h3>\\n' +
'        <ul style="list-style:none;padding:0;margin:0;color:#A0B2C6;font-size:14px;line-height:2;">\\n' +
'          <li>✅ Assistente Virtual com IA no WhatsApp</li>\\n' +
'          <li>✅ Atendimento automático 24h por dia</li>\\n' +
'          <li>✅ Implantação feita pela nossa equipe</li>\\n' +
'          <li>✅ Fluxos de conversa customizados</li>\\n' +
'          <li>✅ Treinamento da IA com os seus serviços</li>\\n' +
'          <li>✅ Agendamentos ilimitados</li>\\n' +
'          <li>✅ Suporte prioritário VIP</li>\\n' +
'        </ul>\\n' +
'      </div>\\n' +
'      <p style="color:#A0B2C6;font-size:14px;line-height:1.6;margin:0 0 24px 0;">\\n' +
'        Donos de lava-rápido que usam o <strong style="color:#F8F9FA;">Plano VIP</strong> relatam até \\n' +
'        <strong style="color:#00B4D8;">40% mais agendamentos</strong> no primeiro mês — simplesmente porque o robô \\n' +
'        atende clientes que mandam mensagem fora do horário comercial.\\n' +
'      </p>\\n' +
'      <div style="text-align:center;">\\n' +
'        <a href="https://wa.me/5511913151641?text=Ol%C3%A1%21%20Acabei%20de%20assinar%20o%20Plano%20Start%20e%20quero%20saber%20mais%20sobre%20o%20Plano%20VIP%20com%20IA%21" \\n' +
'           style="display:inline-block;background:#00B4D8;color:#0D1B2A;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">\\n' +
'          Quero Conhecer o Plano VIP →\\n' +
'        </a>\\n' +
'      </div>\\n' +
'    </div>\\n' +
'    <p style="color:#A0B2C6;font-size:13px;text-align:center;margin:0;">\\n' +
'      Você recebeu este email porque acabou de assinar o LavaZap.<br>\\n' +
'      Qualquer dúvida, responda este email ou fale conosco no WhatsApp.\\n' +
'    </p>\\n' +
'    <div style="text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);">\\n' +
'      <p style="color:#4A5568;font-size:12px;margin:0;">© 2026 LavaZap. Todos os direitos reservados.</p>\\n' +
'    </div>\\n' +
'  </div>\\n' +
'</body>\\n' +
'</html>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + resendKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('RESEND_FROM_EMAIL') || 'LavaZap <onboarding@resend.dev>',
        to: [email],
        subject: '🚀 Coloque seu WhatsApp no Piloto Automático — Conheça o Plano VIP',
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Erro ao enviar email de upsell:', res.status, errBody);
    } else {
      console.log('Email de upsell VIP enviado com sucesso para ' + email);
    }
  } catch (err) {
    console.error('Falha ao enviar email de upsell:', err.message);
  }
}

// ── Webhook Handler ──
Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  
  if (!signature) {
    return new Response('No signature provided', { status: 400 });
  }
  
  const body = await req.text();
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret!,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    console.error('Webhook signature verification failed: ' + err.message);
    return new Response('Webhook Error: ' + err.message, { status: 400 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Received event: ' + event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const assinanteId = session.client_reference_id;
    
    if (assinanteId) {
       console.log('Assinante ID: ' + assinanteId + ' pagou a assinatura.');
       // Descobrir qual plano foi assinado com base no valor cobrado (em centavos)
       try {
         const amountTotal = session.amount_total;
         
         let plano = 'start';
         if (amountTotal === 19700) plano = 'profissional'; // R$ 197
         if (amountTotal === 29700) plano = 'ia_vip';       // R$ 297
         if (amountTotal === 9700) plano = 'start';         // R$ 97

         console.log('Plano identificado: ' + plano + ' (Valor: ' + (amountTotal / 100) + ')');

         const dataExpira = new Date();
         dataExpira.setDate(dataExpira.getDate() + 30); // simplistic expiry 30 days
         
         const { error } = await supabase.from('assinantes').update({
           status_plano: 'ativo',
           nome_plano: plano,
           plano_expira_em: dataExpira.toISOString()
         }).eq('id', assinanteId);

         if (error) {
           console.error("Erro ao atualizar o assinante no Supabase:", error);
           return new Response('Error updating database', { status: 500 });
         }
         console.log('Assinante atualizado com sucesso no Supabase!');

         // ── Enviar email de upsell VIP para assinantes do plano Start ──
         if (plano === 'start') {
           const customerEmail = session.customer_details?.email || session.customer_email;
           if (customerEmail) {
             // Busca o nome da empresa para personalizar o email
             const { data: assinante } = await supabase
               .from('assinantes')
               .select('nome_empresa')
               .eq('id', assinanteId)
               .single();
             
             // Dispara email em background (não bloqueia o webhook)
             sendVipUpsellEmail(customerEmail, assinante?.nome_empresa || '').catch(err => 
               console.error('Erro no envio do email de upsell:', err)
             );
           }
         }

       } catch (err) {
         console.error('Erro ao processar line items ou supabase update:', err.message);
         return new Response('Error processing event', { status: 500 });
       }
    } else {
       console.log('Checkout completado sem client_reference_id');
    }
  }

  // Handle invoice renewals
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    if (subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        // Procurar o assinante pelo email se client_reference_id não estiver disponível
        const email = invoice.customer_email;
        if (email) {
           const dataExpira = new Date(subscription.current_period_end * 1000);
           await supabase.from('assinantes').update({
             status_plano: 'ativo',
             plano_expira_em: dataExpira.toISOString()
           }).eq('email', email);
           console.log('Assinatura renovada para ' + email + ' até ' + dataExpira.toISOString());
        }
      } catch (err) {
        console.error('Erro ao renovar assinatura:', err.message);
      }
    }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});

