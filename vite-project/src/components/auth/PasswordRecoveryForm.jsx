import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../api";

export default function PasswordRecoveryForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
  });

  const [message, setMessage] = useState(null);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.email || form.email.trim() === "") {
      return "Tens de preencher o email";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return "O email não está num formato válido";
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

    try {
      await forgotPassword(form.email);
      showMessage(
        "success",
        "Pedido enviado. Verifique o seu email para redefinir a password.",
      );
      setTimeout(() => navigate("/"), 1200);
    } catch (error) {
      showMessage(
        "error",
        error?.message ||
          "Erro ao solicitar recuperação de password. Verifique o email.",
      );
    }
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
        onClick={() => navigate("/")}
      >
        ←
      </button>

      <form className="recovery__form" onSubmit={handleSubmit}>

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

        <button type="submit" className="form__button">
          Enviar pedido
        </button>

      </form>
    </article>
  );
}