import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import "../styles/criartagsstyle.css";

const API = "http://localhost:3000/api/v1";

export default function CriarTagsPage() {
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [novaTag, setNovaTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const carregar = async () => {
    try {
      const res = await fetch(`${API}/tags`);
      const data = await res.json();
      setTags(Array.isArray(data) ? data : []);
    } catch {
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const handleCriar = async () => {
    const nome = novaTag.trim();
    if (!nome) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`${API}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: "success", text: `Tag "${nome}" criada com sucesso.` });
        setNovaTag("");
        carregar();
      } else {
        setMsg({ type: "error", text: data?.message ?? "Erro ao criar tag." });
      }
    } catch {
      setMsg({ type: "error", text: "Erro ao ligar ao servidor." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ct-page">
      <HeaderGlobal />

      <main className="ct__background">
        <img src="/images/Entartes-6.png" alt="" className="ct__bg-image" />
        <div className="ct__bg-overlay" />

        <div className="ct__center">
          <div className="ct__top-bar">
            <button className="ct__back-btn" onClick={() => navigate("/figurinos")}>←</button>
            <h1 className="ct__title">Gerir Tags</h1>
          </div>

          <div className="ct__card">
            <p className="ct__label">Nova tag</p>
            <div className="ct__input-row">
              <input
                className="ct__input"
                type="text"
                placeholder="Ex: Barroco, Romântico..."
                value={novaTag}
                onChange={e => setNovaTag(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCriar()}
                maxLength={60}
              />
              <button className="ct__btn-criar" onClick={handleCriar} disabled={saving || !novaTag.trim()}>
                {saving ? "A criar..." : "Criar tag"}
              </button>
            </div>

            {msg && (
              <p className={`ct__msg ct__msg--${msg.type}`}>{msg.text}</p>
            )}

            <div className="ct__divider" />

            <p className="ct__label">Tags existentes</p>
            {loading ? (
              <p className="ct__empty">A carregar...</p>
            ) : tags.length === 0 ? (
              <p className="ct__empty">Ainda não há tags criadas.</p>
            ) : (
              <div className="ct__tags-list">
                {tags.map(t => (
                  <span key={t.idtags} className="ct__tag">{t.nome}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
