import { useState } from "react";

export default function LoginForm({ onNavigate }) {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState(null);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    if (!form.email || form.email.trim() === "") {
      return "Tens de preencher o email";
    }

    if (!isValidEmail(form.email)) {
      return "O email não está num formato válido";
    }

    if (!form.password || form.password === "") {
      return "Tens de preencher a password";
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

    showMessage("success", "Validação concluída");
  };

  return (
    <article className="login__card">

      {message && (
        <div className={`alert ${message.type}`}>
          {message.text}
        </div>
      )}

      <button type="button" className="login__back">
        ←
      </button>

      <form className="login__form" onSubmit={handleSubmit}>

        <div className="form__group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Insira o seu email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>

        <div className="form__group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Insira a sua password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />
        </div>

        <button type="submit" className="form__button">
          Entrar
        </button>

        <button
          type="button"
          className="form__link"
          onClick={() => onNavigate("password")}
        >
          Esqueceu-se da sua password?
        </button>

      </form>
    </article>
  );
}