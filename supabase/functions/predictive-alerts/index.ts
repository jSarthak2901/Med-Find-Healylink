import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { doctorId } = await req.json();

    console.log('Analyzing patients for doctor:', doctorId);

    // Fetch appointments for this doctor
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        patient_id,
        appointment_date,
        appointment_time,
        status,
        diagnosis,
        symptoms
      `)
      .eq('doctor_id', doctorId)
      .order('appointment_date', { ascending: false });

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      throw appointmentsError;
    }

    // Get unique patient IDs
    const patientIds = [...new Set(appointments?.map(a => a.patient_id) || [])];

    if (patientIds.length === 0) {
      return new Response(JSON.stringify({ alerts: [], message: 'No patients found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch patient profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', patientIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Fetch patient vitals
    const { data: vitals, error: vitalsError } = await supabase
      .from('patient_vitals')
      .select('*')
      .in('patient_id', patientIds)
      .order('recorded_at', { ascending: false });

    if (vitalsError) {
      console.error('Error fetching vitals:', vitalsError);
    }

    // Fetch therapy recommendations
    const { data: therapyRecs, error: therapyError } = await supabase
      .from('therapy_recommendations')
      .select('*')
      .in('patient_id', patientIds);

    if (therapyError) {
      console.error('Error fetching therapy recommendations:', therapyError);
    }

    // Build patient data summaries
    const patientSummaries = patientIds.map(patientId => {
      const profile = profiles?.find(p => p.user_id === patientId);
      const patientAppointments = appointments?.filter(a => a.patient_id === patientId) || [];
      const patientVitals = vitals?.filter(v => v.patient_id === patientId) || [];
      const patientTherapy = therapyRecs?.filter(t => t.patient_id === patientId) || [];

      // Check for missed/cancelled appointments
      const missedAppointments = patientAppointments.filter(a => 
        a.status === 'cancelled' || a.status === 'no_show'
      ).length;

      // Check latest vitals
      const latestVitals = patientVitals[0];

      return {
        patientId,
        name: profile?.full_name || 'Unknown Patient',
        totalAppointments: patientAppointments.length,
        missedAppointments,
        lastAppointment: patientAppointments[0],
        latestVitals,
        activeTherapy: patientTherapy.filter(t => t.status === 'active').length,
        pendingTherapy: patientTherapy.filter(t => t.status === 'pending').length,
      };
    });

    // Prepare prompt for AI analysis
    const analysisPrompt = `You are a medical AI assistant helping doctors identify at-risk patients. Analyze the following patient data and identify any patients who may be at risk of:
1. Missing therapy sessions (based on missed appointments history)
2. Worsening health conditions (based on vitals trends)
3. Non-compliance with treatment plans

Patient Data:
${JSON.stringify(patientSummaries, null, 2)}

For each at-risk patient, provide:
- Patient name
- Risk type (missed_therapy, worsening_condition, non_compliance)
- Risk level (high, medium, low)
- Brief explanation (1-2 sentences)
- Recommended action

Return your analysis as a JSON array of alerts. If no patients are at risk, return an empty array.
Format: [{"patient_name": "...", "patient_id": "...", "risk_type": "...", "risk_level": "...", "explanation": "...", "recommended_action": "..."}]`;

    console.log('Sending analysis request to AI...');

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a medical AI assistant. Always respond with valid JSON.' },
          { role: 'user', content: analysisPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI Gateway error');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '[]';

    console.log('AI Response:', aiContent);

    // Parse AI response
    let alerts = [];
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        alerts = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      alerts = [];
    }

    // Store alerts in database
    for (const alert of alerts) {
      const patientSummary = patientSummaries.find(p => p.patientId === alert.patient_id);
      if (patientSummary) {
        const { error: insertError } = await supabase
          .from('alerts')
          .insert({
            patient_id: alert.patient_id,
            doctor_id: doctorId,
            title: `${alert.risk_type === 'missed_therapy' ? '⚠️ Risk of Missed Therapy' : 
                     alert.risk_type === 'worsening_condition' ? '🔴 Worsening Condition' : 
                     '⚡ Non-Compliance Risk'}`,
            message: alert.explanation,
            alert_type: alert.risk_type,
            severity: alert.risk_level,
            is_resolved: false,
            is_read: false,
          });

        if (insertError) {
          console.error('Error inserting alert:', insertError);
        }
      }
    }

    return new Response(JSON.stringify({ 
      alerts,
      analyzed_patients: patientSummaries.length,
      message: `Generated ${alerts.length} predictive alerts`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in predictive-alerts function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});