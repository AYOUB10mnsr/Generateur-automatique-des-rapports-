import { useEffect, useState } from "react";
import { CheckCircle2, ServerCrash } from "lucide-react";
import { apiHealth } from "../services/api";
import { useSettings } from "../contexts/SettingsContext";
import { useTheme } from "../contexts/ThemeContext";
import { Button, Card, Page, Select } from "../components/common/ui";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { defaultLanguage, setDefaultLanguage, speakerThreshold, setSpeakerThreshold, aiModel, setAiModel } = useSettings();
  const [healthy, setHealthy] = useState(null);

  useEffect(() => { apiHealth().then(() => setHealthy(true)).catch(() => setHealthy(false)); }, []);

  return (
    <Page>
      <Card className="space-y-4">
        <h1 className="font-display text-2xl">Settings</h1>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="mb-1 text-sm text-muted">Theme</p>
            <Select value={theme} onChange={(e) => setTheme(e.target.value)}><option value="cyber">Cyber Theme</option><option value="clean">Clean Professional</option></Select>
          </div>
          <div>
            <p className="mb-1 text-sm text-muted">Default report language</p>
            <Select value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value)}><option value="auto">Auto</option><option value="fr">French</option><option value="en">English</option><option value="ar">Arabic</option></Select>
          </div>
          <div>
            <p className="mb-1 text-sm text-muted">Speaker threshold ({speakerThreshold})</p>
            <input type="range" min="0.4" max="0.95" step="0.01" value={speakerThreshold} onChange={(e) => setSpeakerThreshold(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <p className="mb-1 text-sm text-muted">AI model</p>
            <Select value={aiModel} onChange={(e) => setAiModel(e.target.value)}><option>llama-3.3-70b-versatile</option><option>gpt-4o-mini</option><option>gpt-4.1</option></Select>
          </div>
        </div>
        <div className="rounded-xl border border-app p-3 text-sm">
          <p className="mb-1 font-semibold">Backend status</p>
          <p className="flex items-center gap-2">{healthy ? <CheckCircle2 size={16} className="text-green-500" /> : <ServerCrash size={16} className="text-red-500" />}{healthy === null ? "Checking..." : healthy ? "Online" : "Offline"}</p>
        </div>
        <Button variant="ghost">Settings auto-saved</Button>
      </Card>
    </Page>
  );
}
