import { useState, useEffect } from "react";

const API = "http://localhost:3000/api/v1";

export default function StudioForm({ studio, modalities, studios, onClose, onSaved, setMessage }) {
  // se recebemos um studio é porque estamos a editar, senão é criar novo
  const isEdit = !!studio;

  // estado do formulário
  const [form, setForm] = useState({
    nome: "",
    capacidade_maxima: "",
    descricao: "",
    estado: "operacional",
    modalidades: []
  });

  // controla se o modal de confirmação de apagar está aberto
  const [showConfirm, setShowConfirm] = useState(false);

  // quando estamos a editar, preencher o form com os dados do estúdio
  useEffect(() => {
    if (!studio) return;

    setForm({
      nome: studio.nome || "",
      capacidade_maxima: studio.capacidade_maxima || "",
      descricao: studio.descricao || "",
      estado: studio.estado || "operacional",
      modalidades: studio.modalidades?.map(m => m.id) || []
    });
  }, [studio]);

  // função para atualizar um campo do form
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // adicionar uma modalidade quando se escolhe no dropdown
  const handleAddModalidade = (e) => {
    const id = Number(e.target.value);
    if (!id) return;

    // só adiciona se ainda não estiver na lista
    if (!form.modalidades.includes(id)) {
      setForm(prev => ({
        ...prev,
        modalidades: [...prev.modalidades, id]
      }));
    }

    // limpa o dropdown depois de adicionar
    e.target.value = "";
  };

  // remover modalidade quando clicamos no x do chip
  const handleRemoveModalidade = (id) => {
    setForm(prev => ({
      ...prev,
      modalidades: prev.modalidades.filter(m => m !== id)
    }));
  };

  // modalidades que ainda não foram escolhidas (para mostrar no dropdown)
  const availableModalities = modalities.filter(
    m => !form.modalidades.includes(m.id)
  );

  // modalidades já escolhidas (para mostrar como chips)
  const selectedModalities = form.modalidades
    .map(id => modalities.find(m => m.id === id))
    .filter(Boolean);

  // validar o form antes de enviar
  const validateForm = () => {
    if (!form.nome || form.nome.trim() === "") {
      return "Tens de dar um nome ao estúdio";
    }
    if (form.capacidade_maxima && Number(form.capacidade_maxima) <= 0) {
      return "A capacidade tem de ser maior que zero";
    }

    // verificar se ja existe outro estudio com este nome (case-insensitive)
    const nomeNormalizado = form.nome.trim().toLowerCase();
    const duplicado = studios?.find(s =>
      s.nome.toLowerCase() === nomeNormalizado &&
      s.id !== studio?.id
    );

    if (duplicado) {
      return `Já existe um estúdio com o nome "${form.nome}"`;
    }

    return null;
  };

  // criar ou atualizar estúdio
  const handleSubmit = async (e) => {
    e.preventDefault();

    // validar antes de enviar
    const validationError = validateForm();
    if (validationError) {
      setMessage?.({ type: "error", text: validationError });
      return;
    }

    try {
      // url e método dependem se estamos a criar ou editar
      const url = isEdit ? `${API}/studios/${studio.id}` : `${API}/studios`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          capacidade_maxima: form.capacidade_maxima
            ? Number(form.capacidade_maxima)
            : null,
          descricao: form.descricao.trim() || null,
          estado: form.estado,
          modalidades: form.modalidades
        })
      });

      const data = await res.json();

      // se o backend deu erro, mostrar mensagem
      if (!res.ok) {
        const errorText = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Não foi possível guardar o estúdio";
        setMessage?.({ type: "error", text: errorText });
        return;
      }

      // sucesso - mostrar mensagem e fechar form
      setMessage?.({
        type: "success",
        text: isEdit ? "Estúdio atualizado com sucesso" : "Estúdio criado com sucesso"
      });

      onSaved?.();
      onClose?.();

    } catch {
      setMessage?.({ type: "error", text: "Não foi possível ligar ao servidor" });
    }
  };

  // apagar estúdio - o backend trata de realocar aulas e coachings
  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/studios/${studio.id}`, { method: "DELETE" });

      if (!res.ok) {
        setMessage?.({ type: "error", text: "Não foi possível remover o estúdio" });
        return;
      }

      const data = await res.json();

      // mensagem detalhada se houve aulas ou coachings afetados
      let text = "Estúdio removido com sucesso";
      if (data.afetados > 0) {
        const partes = [];
        if (data.aulas > 0) partes.push(`${data.aulas} aula(s)`);
        if (data.coachings > 0) partes.push(`${data.coachings} coaching(s)`);
        text += `. ${partes.join(" e ")} foram realocadas ou desativadas.`;
      }

      setMessage?.({ type: "success", text });
      onSaved?.();
      onClose?.();

    } catch {
      setMessage?.({ type: "error", text: "Não foi possível ligar ao servidor" });
    }
  };

  return (
    <>
      <form className="form" onSubmit={handleSubmit}>
        <h2>{isEdit ? "Editar Estúdio" : "Novo Estúdio"}</h2>

        <label>Nome</label>
        <input
          value={form.nome}
          onChange={(e) => handleChange("nome", e.target.value)}
          placeholder="Ex: Estúdio 8"
        />

        <label>Capacidade Máxima</label>
        <input
          type="number"
          min="1"
          value={form.capacidade_maxima}
          onChange={(e) => handleChange("capacidade_maxima", e.target.value)}
          placeholder="Número de pessoas"
        />

        <label>Descrição</label>
        <textarea
          value={form.descricao}
          onChange={(e) => handleChange("descricao", e.target.value)}
          placeholder="Ex: Estúdio principal com espelhos"
        />

        <label>Estado</label>
        <select
          value={form.estado}
          onChange={(e) => handleChange("estado", e.target.value)}
        >
          <option value="operacional">Operacional</option>
          <option value="manutencao">Manutenção</option>
          <option value="inoperacional">Inoperacional</option>
        </select>

        <label>Modalidades suportadas</label>

        {/* dropdown para adicionar modalidades */}
        <select
          onChange={handleAddModalidade}
          defaultValue=""
          disabled={availableModalities.length === 0}
        >
          <option value="">
            {availableModalities.length === 0
              ? "Todas as modalidades adicionadas"
              : "Adicionar modalidade..."
            }
          </option>
          {availableModalities.map(m => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>

        {/* mostrar as modalidades já selecionadas como chips */}
        {selectedModalities.length > 0 && (
          <div className="modalities-selected">
            {selectedModalities.map(m => (
              <span key={m.id} className="modality-tag">
                {m.nome}
                <button
                  type="button"
                  onClick={() => handleRemoveModalidade(m.id)}
                  aria-label={`Remover ${m.nome}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <button type="submit" className="submit">
          {isEdit ? "Guardar Alterações" : "Criar Estúdio"}
        </button>

        {/* botão de apagar só aparece quando estamos a editar */}
        {isEdit && (
          <button
            type="button"
            className="delete"
            onClick={() => setShowConfirm(true)}
          >
            Apagar Estúdio
          </button>
        )}
      </form>

      {/* modal de confirmação para apagar */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Apagar estúdio?</h3>
            <p>
              As aulas e coachings deste estúdio serão automaticamente realocados
              para outro estúdio compatível, ou desativados se não houver alternativa.
              Esta ação não pode ser desfeita.
            </p>

            <div className="modal-actions">
              <button className="cancel" onClick={() => setShowConfirm(false)}>
                Cancelar
              </button>
              <button
                className="delete"
                onClick={async () => {
                  setShowConfirm(false);
                  await handleDelete();
                }}
              >
                Sim, apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}