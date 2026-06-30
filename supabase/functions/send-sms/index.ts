import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Supabase Custom SMS Hook template
// Expected payload: { user: { phone: string }, sms: { code: string } }
serve(async (req) => {
  try {
    const body = await req.json();
    const phone = body.user?.phone;
    const code = body.sms?.code;

    if (!phone || !code) {
      return new Response(JSON.stringify({ error: "Missing phone or code" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`[LavaZap SMS Hook] Sending OTP ${code} to ${phone}`);

    // TODO: Integrate with WhatsApp API (Evolution API, Z-API) or SMS provider here.
    // Example: 
    // await fetch('https://api.whatsapp-provider.com/send', {
    //   method: 'POST',
    //   body: JSON.stringify({ to: phone, text: `Seu código de verificação LavaZap é: ${code}` })
    // })

    return new Response(JSON.stringify({ success: true, message: "OTP sent via Webhook" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
