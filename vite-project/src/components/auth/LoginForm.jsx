import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api";

export default function LoginForm({ onNavigate, onLoginSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      showMessage("error", validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login(form);
      localStorage.setItem("entartes_auth", JSON.stringify({
        accessToken: response.accessToken,
        user: response.user,
      }));
      showMessage("success", "Login efetuado com sucesso");
      onLoginSuccess?.(response);

      const roles = response?.user?.roles || [];
      if (roles.includes("professor")) {
        navigate("/professor");
      } else if (roles.includes("responsavel")) {
        navigate("/homestudents");
      } else if (roles.includes("coordenacao")) {
        navigate("/report");
      }
    } catch (error) {
      showMessage(
        "error",
        error?.message || "Erro ao autenticar. Verifique o email e a password",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    if (onNavigate) {
      onNavigate("password");
      return;
    }

    navigate("/recuperar-senha");
  };

  return (
    <article className="login__card">

      {message && (
        <div className={`alert ${message.type}`}>
          {message.text}
        </div>
      )}

      <button
        type="button"
        className="login__back"
        onClick={() => onNavigate?.("login")}
        disabled={isSubmitting}
      >
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

        <button type="submit" className="form__button" disabled={isSubmitting}>
          {isSubmitting ? "A entrar..." : "Entrar"}
        </button>

        <button
          type="button"
          className="form__link"
          onClick={handleForgotPassword}
          disabled={isSubmitting}
        >
          Esqueceu-se da sua password?
        </button>

      </form>
    </article>
  );
}
