import { useState } from "react";
import { usePresente } from "../hooks/usePresente.js";
import "./Home.css";
import ReactGA from "react-ga4";

const OCASIOES = [
  "Aniversário",
  "Natal",
  "Dia das Mães",
  "Dia dos Pais",
  "Dia dos Namorados",
  "Casamento",
  "Formatura",
  "Amigo Secreto",
  "Chá de Bebê",
  "Sem ocasião especial",
];

const STEPS = [
  {
    field: "quem",
    label: "Para quem é o presente?",
    placeholder: "ex: minha mãe, meu melhor amigo...",
    type: "text",
  },
  {
    field: "idade",
    label: "Qual a idade da pessoa?",
    placeholder: "ex: 45",
    type: "number",
    min: 1,
    max: 120,
  },
  {
    field: "personalidade",
    label: "Como é essa pessoa? O que ela gosta?",
    placeholder: "ex: adora cozinhar, é caseira, gosta de séries e café...",
    type: "textarea",
  },
  {
    field: "ocasiao",
    label: "Qual a ocasião?",
    type: "select",
    options: OCASIOES,
  },
  {
    field: "orcamento",
    label: "Quanto quer gastar? (R$)",
    placeholder: "ex: 150",
    type: "number",
    min: 10,
  },
];

const initialForm = {
  quem: "",
  idade: "",
  personalidade: "",
  ocasiao: "Aniversário",
  orcamento: "",
};

const DEPOIMENTOS = [
  {
    nome: "Camila R.",
    texto:
      "Usei para o aniversário da minha mãe e ela amou o presente! Nunca teria pensado naquilo sozinha.",
    ocasiao: "Dia das Mães",
  },
  {
    nome: "Lucas M.",
    texto:
      "Sempre sofria com amigo secreto. Em 30 segundos o site me deu a ideia perfeita.",
    ocasiao: "Amigo Secreto",
  },
  {
    nome: "Fernanda S.",
    texto:
      "A mensagem do cartão ficou tão bonita que meu namorado chorou. Recomendo demais!",
    ocasiao: "Dia dos Namorados",
  },
];

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(-1); // -1 = landing
  const [copied, setCopied] = useState(false);
  const { resultado, loading, error, buscarSugestoes, resetar } = usePresente();

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function canAdvance() {
    if (step < 0) return false;
    const { field, type } = STEPS[step];
    const val = form[field];
    if (type === "select") return true;
    return val !== "" && val !== undefined;
  }

  function nextStep() {
    ReactGA.event({
      category: "Interação",
      action: "Avanço de fase",
      label: STEPS[step]?.label || "",
    });
    if (step < STEPS.length - 1) setStep(step + 1);
  }

  function prevStep() {
    ReactGA.event({
      category: "Interação",
      action: "Recuo de fase",
      label: STEPS[step]?.label || "",
    });
    if (step > 0) setStep(step - 1);
  }

  function startForm() {
    setStep(0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await buscarSugestoes({
      ...form,
      idade: Number(form.idade),
      orcamento: Number(form.orcamento),
    });
  }

  function handleReset() {
    resetar();
    setForm(initialForm);
    setStep(-1);
    setCopied(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && step >= 0 && STEPS[step].type !== "textarea") {
      e.preventDefault();
      if (step < STEPS.length - 1 && canAdvance()) {
        nextStep();
      } else if (step === STEPS.length - 1 && canAdvance()) {
        handleSubmit(e);
      }
    }
  }

  function handleCopy(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ---------- LOADING ----------
  if (loading) {
    return (
      <div className="container center-content">
        <div className="loading-state">
          <div className="gift-spinner" />
          <h2>Buscando os presentes perfeitos...</h2>
          <p className="muted">
            A IA está analisando o perfil e escolhendo sugestões personalizadas
          </p>
          <div className="loading-tips">
            <span>Isso leva apenas alguns segundos</span>
          </div>
        </div>
      </div>
    );
  }

  // ---------- RESULTADOS ----------
  if (resultado) {
    return (
      <div className="container results-container">
        <header className="results-header">
          <span className="badge">5 sugestões para {form.quem}</span>
          <h1>Presentes encontrados!</h1>
          <p className="muted">
            Clique em "Ver na Amazon" para comprar com o melhor preço
          </p>
        </header>

        <div className="grid">
          {resultado.sugestoes.map((s, i) => (
            <div className="card" key={i}>
              <div className="card-top">
                <span className="card-number">{i + 1}</span>
                <span className="categoria">{s.categoria}</span>
                {s.tipo === "experiencia" && (
                  <span className="tag-exp">Experiência</span>
                )}
              </div>
              <h3>{s.titulo}</h3>
              <p className="card-desc">{s.descricao}</p>
              <div className="card-footer">
                <strong className="preco">{s.faixaPreco}</strong>
                <a
                  href={s.linkBusca}
                  target="_blank"
                  rel="noreferrer"
                  className={`btn-buscar ${s.tipo === "experiencia" ? "btn-exp" : ""}`}
                >
                  {s.tipo === "experiencia" ? "Saiba mais" : "Ver na Amazon"}
                </a>
              </div>
            </div>
          ))}
        </div>

        {resultado.mensagemCartao && (
          <div className="cartao">
            <div className="cartao-icon">&#9993;</div>
            <h2>Mensagem para o cartão</h2>
            <blockquote>{resultado.mensagemCartao}</blockquote>
            <button
              className="btn-copy"
              onClick={() => handleCopy(resultado.mensagemCartao)}
            >
              {copied ? "Copiada!" : "Copiar mensagem"}
            </button>
          </div>
        )}

        <div className="results-actions">
          <button className="btn-secondary" onClick={handleReset}>
            Buscar outros presentes
          </button>
          <button
            className="btn-share"
            onClick={() => handleCopy(window.location.href)}
          >
            Compartilhar site
          </button>
        </div>

        <Footer />
      </div>
    );
  }

  // ---------- FORMULÁRIO (STEPPER) ----------
  if (step >= 0) {
    const currentStep = STEPS[step];
    const isLast = step === STEPS.length - 1;
    const progress = ((step + 1) / STEPS.length) * 100;

    return (
      <div className="container center-content">
        <form
          className="form"
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
        >
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="step-counter">
            Pergunta {step + 1} de {STEPS.length}
          </span>

          <div className="step-content">
            <label className="step-label">{currentStep.label}</label>

            {currentStep.type === "select" ? (
              <div className="options-grid">
                {currentStep.options.map((o) => (
                  <button
                    type="button"
                    key={o}
                    className={`option-btn ${form[currentStep.field] === o ? "option-active" : ""}`}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, [currentStep.field]: o }))
                    }
                  >
                    {o}
                  </button>
                ))}
              </div>
            ) : currentStep.type === "textarea" ? (
              <textarea
                name={currentStep.field}
                placeholder={currentStep.placeholder}
                value={form[currentStep.field]}
                onChange={handleChange}
                rows={3}
                autoFocus
              />
            ) : (
              <input
                name={currentStep.field}
                type={currentStep.type}
                placeholder={currentStep.placeholder}
                min={currentStep.min}
                max={currentStep.max}
                value={form[currentStep.field]}
                onChange={handleChange}
                autoFocus
              />
            )}
          </div>

          {error && <p className="error">{error}</p>}

          <div className="step-actions">
            <button
              type="button"
              className="btn-back"
              onClick={step === 0 ? handleReset : prevStep}
            >
              Voltar
            </button>
            {isLast ? (
              <button
                className="btn-primary"
                type="submit"
                disabled={!canAdvance()}
              >
                Encontrar presentes
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={nextStep}
                disabled={!canAdvance()}
              >
                Continuar
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  // ---------- LANDING PAGE ----------
  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <h1>Encontre o presente ideal</h1>
          <p className="hero-sub">
            Nossa IA encontra sugestões perfeitas em segundos.
          </p>

          <div className="hero-cta-area">
            <label htmlFor="quem-input">{STEPS[0].label}</label>
            <div className="hero-input-group">
              <input
                id="quem-input"
                name="quem"
                type="text"
                placeholder={STEPS[0].placeholder}
                value={form.quem}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && form.quem.trim()) {
                    setStep(1);
                  }
                }}
                autoFocus
              />
              <button
                className="btn-cta"
                onClick={() => {
                  if (form.quem.trim()) {
                    setStep(1);
                  } else {
                    document.getElementById("quem-input").focus();
                  }
                }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p>PresentePerfeito &mdash; Sugestões inteligentes de presente com IA</p>
      <p className="footer-sub">
        Links de compra direcionam para a Amazon. Como associados Amazon,
        podemos ganhar comissões por compras qualificadas.
      </p>
    </footer>
  );
}
