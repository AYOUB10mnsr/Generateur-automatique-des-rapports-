import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { addSpeakerSamples, deleteSpeakerById, listSpeakers, registerSpeaker, renameSpeakerById } from "../services/api";
import { Button, Card, Input, Page } from "../components/common/ui";

export default function SpeakerManagementPage() {
  const [speakers, setSpeakers] = useState([]);
  const [name, setName] = useState("");
  const [files, setFiles] = useState([]);

  const load = async () => {
    const data = await listSpeakers();
    setSpeakers(Array.isArray(data) ? data : data?.items || []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name || !files.length) return toast.error("Name and samples required");
    await registerSpeaker({ name, samples: files });
    setName(""); setFiles([]); toast.success("Speaker registered"); load();
  };

  return (
    <Page>
      <Card>
        <h1 className="font-display text-xl">Speaker Intelligence Management</h1>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Input placeholder="Speaker name" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="input-shell flex cursor-pointer items-center justify-center gap-2"><Upload size={15} /> {files.length ? `${files.length} sample(s)` : "Upload reference audio"}
            <input type="file" className="hidden" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
          </label>
          <Button onClick={create}><Plus size={15} /> Register Speaker</Button>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {speakers.map((s) => (
          <Card key={s.id} className="space-y-3">
            <div className="h-1.5 rounded-full bg-[linear-gradient(90deg,#22c55e,#22d3ee)]" />
            <h3 className="font-display text-lg">{s.name}</h3>
            <p className="text-sm text-muted">Samples: {s.samples_count || 0}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={async () => {
                const newName = prompt("New name", s.name);
                if (!newName) return;
                await renameSpeakerById(s.id, newName);
                load();
              }}><Pencil size={14} /> Rename</Button>
              <label className="btn btn-ghost cursor-pointer"><Plus size={14} /> Add samples
                <input className="hidden" type="file" multiple onChange={async (e) => { const f = Array.from(e.target.files || []); if (!f.length) return; await addSpeakerSamples(s.id, f); toast.success("Samples added"); load(); }} />
              </label>
              <Button variant="ghost" onClick={async () => { await deleteSpeakerById(s.id); load(); }}><Trash2 size={14} /> Delete</Button>
            </div>
          </Card>
        ))}
      </section>
    </Page>
  );
}
