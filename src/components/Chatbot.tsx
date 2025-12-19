import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
};

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const append = (m: Message) => setMessages((s) => [...s, m]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: String(Date.now()) + "-u", sender: "user", text };
    append(userMsg);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      let botText = "";
      if (data.type === "no_match") {
        botText = data.message || "I couldn't identify a specific condition. Can you tell me more?";
      } else if (data.type === "match") {
        botText = `Condition: ${data.condition} (confidence: ${data.confidence}%)\n`;
        if (data.therapies && Array.isArray(data.therapies)) {
          botText += "\nTherapies:\n" + data.therapies.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n");
        }
        if (data.exercises && Array.isArray(data.exercises)) {
          botText += "\n\nExercises:\n" + data.exercises.map((e: string, i: number) => `${i + 1}. ${e}`).join("\n");
        }
        if (data.duration) botText += `\n\nExpected duration: ${data.duration}`;
      } else {
        botText = JSON.stringify(data);
      }

      const botMsg: Message = { id: String(Date.now()) + "-b", sender: "bot", text: botText };
      append(botMsg);
    } catch (err) {
      append({ id: String(Date.now()) + "-b-err", sender: "bot", text: "Error contacting chat service." });
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-80">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2">
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground">Ask about symptoms, medications, or care tips.</div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`rounded-lg p-2 max-w-full whitespace-pre-wrap ${m.sender === "user" ? "bg-primary/10 self-end" : "bg-muted"}`}>
              <div className="text-sm">{m.text}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Describe your symptom or ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <Button onClick={sendMessage} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chatbot;
