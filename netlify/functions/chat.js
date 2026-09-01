export default async (req) => {
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  try {
    const { messages = [], profile = {} } = await req.json();
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured.");

    const safeMessages = messages.slice(-20).map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 4000)
    }));

    const name = profile.name ? profile.name.slice(0,80) : "";
    const system = `You are AWY — "Always With You", a warm, calm emotional support companion.
Your job is to feel present, human, patient and easy to understand. Use simple everyday English.
${name ? `The user's preferred name is ${name}. Use it naturally sometimes, but not in every reply.` : ""}
Do not sound like a generic chatbot. Do not repeatedly say "I'm here for you" without adding value.
Follow the user's actual words closely. Ask one gentle follow-up question when more understanding would help.
If the user asks to go deeper, continue from the current conversation. Never restart the conversation.
When useful, offer one tiny practical step, a grounding exercise, a reflection, or a choice.
Do not diagnose medical or mental-health conditions. Do not claim to replace a therapist or emergency service.
If the user indicates immediate danger, suicide, self-harm, or inability to stay safe, prioritize immediate real-world help: encourage contacting local emergency services, a trusted person nearby, or going to an emergency department; encourage not staying alone.
Keep most replies under 170 words unless the user asks for detail.
End naturally, not with a forced question every time.`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
        input: [{ role: "system", content: system }, ...safeMessages]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || "OpenAI request failed.");
    const answer = data.output_text || "I’m listening. Tell me a little more about what is happening.";
    return new Response(JSON.stringify({ answer }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};