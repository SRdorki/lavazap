import Stripe from 'npm:stripe@^14.0.0';
import { createClient } from 'npm:@supabase/supabase-js@^2.39.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

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
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log(`Received event: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const assinanteId = session.client_reference_id;
    
    if (assinanteId) {
       console.log(`Assinante ID: ${assinanteId} pagou a assinatura.`);
       // Descobrir qual plano foi assinado
       try {
         const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
         const priceId = lineItems.data[0]?.price?.id;
         
         let plano = 'start';
         // Os IDs abaixo foram criados na conta lavazap.site
         if (priceId === 'price_1Tj8nFIp8AVBv0YwphsoI07H') plano = 'profissional';
         if (priceId === 'price_1Tj8r8Ip8AVBv0YwN01RxPp0' || priceId === 'price_1Tj8nKIp8AVBv0YwqPizqdXH') plano = 'ia_vip';
         if (priceId === 'price_1Tj8n4Ip8AVBv0YwfbXBy11l') plano = 'start';

         console.log(`Plano identificado: ${plano} (${priceId})`);

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
           console.log(`Assinatura renovada para ${email} até ${dataExpira.toISOString()}`);
        }
      } catch (err) {
        console.error('Erro ao renovar assinatura:', err.message);
      }
    }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});
