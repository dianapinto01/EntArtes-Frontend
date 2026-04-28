import { useState } from "react";

export default function PasswordRecoveryForm({ onNavigate }) {
  const [form, setForm] = useState({
    password: "",
    codigo: ""
  });

  const [message, setMessage] = useState(null);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.password || form.password === "") {
      return "Tens de preencher a nova password";
    }

    if (form.password.length < 6) {
      return "A password tem de ter pelo menos 6 caracteres";
    }

    if (!form.codigo || form.codigo.trim() === "") {
      return "Tens de inserir o código de acesso";
    }

    return null;
  };

  function showMessage(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      showMessage("error", validationError);
      return;
    }

    showMessage("success", "Password alterada com sucesso");

    // voltar ao login depois de 1s
    setTimeout(() => onNavigate?.("login"), 1000);
  };

  return (
    <article className="recovery__card">

      {message && (
        <div className={`alert ${message.type}`}>
          {message.text}
        </div>
      )}

      <button
        type="button"
        className="login__back"
        onClick={() => onNavigate?.("login")}
      >
        ←
      </button>

      <form className="recovery__form" onSubmit={handleSubmit}>

        <div className="form__group">
          <label htmlFor="password">Nova password</label>
          <input
            id="password"
            type="password"
            placeholder="Insira a nova password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />
        </div>

        <div className="form__group">
          <label htmlFor="codigo">Código de acesso</label>
          <input
            id="codigo"
            type="text"
            placeholder="Insira o código de acesso que recebeu por sms/email"
            value={form.codigo}
            onChange={(e) => handleChange("codigo", e.target.value)}
          />
        </div>

        <button type="submit" className="form__button">
          Entrar
        </button>

      </form>
    </article>
  );
}