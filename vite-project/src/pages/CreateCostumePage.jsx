import { useNavigate } from "react-router-dom";
import HeaderGlobal from "../components/layout/HeaderGlobal";
import Footer from "../components/layout/Footer";
import CreateCostumeForm from "../components/costumes/CreateCostumeForm";
import "../styles/createcostumestyle.css";

export default function CreateCostumePage() {
  const navigate = useNavigate();

  return (
    <div className="create-costume-page">
      <HeaderGlobal />

      <main className="create-costume__background">
        <img src="/images/Entartes-6.png" alt="" className="create-costume__bg-image" />
        <div className="create-costume__bg-overlay" />

        <CreateCostumeForm
          onBack={() => navigate("/figurinos")}
          onSuccess={() => navigate("/figurinos")}
        />
      </main>

      <Footer />
    </div>
  );
}
