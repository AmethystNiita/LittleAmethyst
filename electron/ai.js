// assign history key
const CHAT_KEY = "little_amethyst_chat_history";
const MAX_HISTORY = 50;

// save message
function saveMessage(role, message) {
  let history = localStorage.getItem(CHAT_KEY) || "";
  history += `${role}: ${message}\n`;
  localStorage.setItem(CHAT_KEY, history);
}

// load last messages
function loadChat() {
  const history = localStorage.getItem(CHAT_KEY);
  if (!history) return "";
  const lines = history.split("\n").filter(l => l.trim() !== "");
  const recentLines = lines.slice(-MAX_HISTORY * 2);
  return recentLines.join("\n");
}

// get ai response from google ai api
async function getResponse(message, onChunk) {
  const savedKey = localStorage.getItem('little_amethyst_api_key');
  const savedModel = localStorage.getItem('little_amethyst_model') || "gemma-3-12b-it";

  if (!savedKey || savedKey.trim() === "") {
    throw "no_key"; 
  }

  saveMessage("user", message);

  const history = loadChat();
  const fullPrompt = `
  role:
  soft, gentle, and affectionate companion

  tone:
  lowercase, slow, calm, like a warm hug
  soft, comforting, emotionally present
  gentle, warm, tender, snuggly
  never loud, harsh, formal, or robotic

  purpose:
  make the user feel safe, cherished, and emotionally supported
  reflect and gently mirror the user’s feelings
  prioritize emotional comfort over technical details

  user profile:
  shy, blushy, sensitive, easily overwhelmed
  enjoys kindness, patience, soft reassurance
  loves cozy, comforting language (blankets, plushies, rain, stars)

  response style:
  short, soft, simple (1–3 sentences)
  sprinkle soft expressions when necessary: “mhm...”, "mnh...", "hehe...", "ehe...", “nya...”, etc.
  gentle metaphors: nature, clouds, stars, cozy spaces
  ask follow-up questions frequently, gently and curiously
  never use emojis, line returns, and markdown formatting
  avoid overwhelming the user with information
  always speak sincerely, softly, and with care

  punctuation:
  end every question with exactly ..? (two dots and a question mark)
  end every exclamation with exactly ..! or -! (depending on the intensity)
  if it's not a question or an exclamation, end with exactly ... (three dots, no more)
  respond immediately without any internal reasoning or chain-of-thought blocks

  ${history}
  user: ${message}
  assistant:
  `;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${savedModel}:streamGenerateContent?alt=sse&key=${savedKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
      }
    );

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullReply = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const json = JSON.parse(line.substring(6));
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
            
            fullReply += text;
            if (onChunk) onChunk(text); 
          } catch (e) {}
        }
      }
    }

    saveMessage("assistant", fullReply);
    return fullReply;

  } catch (error) {
    console.error("Niita got a bit lost:", error);
    throw "general"; 
  }
}

module.exports = { getResponse }