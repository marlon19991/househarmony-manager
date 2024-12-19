import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages'

interface WhatsAppMessage {
  profileId: number;
  message: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { profileId, message } = await req.json() as WhatsAppMessage

    // Get profile WhatsApp number
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('whatsapp_number')
      .eq('id', profileId)
      .single()

    if (profileError || !profile?.whatsapp_number) {
      console.error('Error getting profile:', profileError)
      return new Response(
        JSON.stringify({ error: 'Error getting profile WhatsApp number' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Send WhatsApp message
    const whatsappResponse = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('WHATSAPP_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: profile.whatsapp_number,
        type: 'text',
        text: { body: message }
      }),
    })

    if (!whatsappResponse.ok) {
      const error = await whatsappResponse.text()
      console.error('WhatsApp API error:', error)
      throw new Error('Failed to send WhatsApp message')
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})