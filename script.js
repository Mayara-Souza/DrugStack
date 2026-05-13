const data = [
  { id:1, reference:"Losartana",   mechanism:"Bloqueia receptores AT1 da angiotensina II", pharmacClass:"BRA" },
  { id:2, reference:"Omeprazol",   mechanism:"Inibe bomba de prótons H+/K+ ATPase",         pharmacClass:"IBP" },
  { id:3, reference:"Metformina",  mechanism:"Reduz gliconeogênese hepática",                pharmacClass:"Biguanida" },
  { id:4, reference:"Atenolol",    mechanism:"Bloqueia receptores beta-1 adrenérgicos",      pharmacClass:"Betabloqueador" },
  { id:5,  reference:"Dipirona",        mechanism:"Inibe a síntese de prostaglandinas",                     pharmacClass:"Analgésico antipirético" },
  { id:6,  reference:"Ibuprofeno",      mechanism:"Inibe as enzimas COX-1 e COX-2",                        pharmacClass:"Anti-inflamatório não esteroidal" },
  { id:7,  reference:"Diclofenaco",     mechanism:"Reduz a produção de prostaglandinas inflamatórias",    pharmacClass:"Anti-inflamatório não esteroidal" },
  { id:8,  reference:"Cetirizina",      mechanism:"Bloqueia receptores H1 da histamina",                  pharmacClass:"Anti-histamínico" },
  { id:9,  reference:"Loratadina",      mechanism:"Antagoniza receptores H1 periféricos",                 pharmacClass:"Anti-histamínico" },
  { id:10, reference:"Fexofenadina",    mechanism:"Inibe receptores H1 da histamina",                     pharmacClass:"Anti-histamínico" },
  { id:11, reference:"Prednisona",      mechanism:"Modula expressão gênica inflamatória",                 pharmacClass:"Corticosteroide" },
  { id:12, reference:"Dexametasona",    mechanism:"Suprime mediadores inflamatórios",                     pharmacClass:"Corticosteroide" },
  { id:13, reference:"Amoxicilina",     mechanism:"Inibe síntese da parede bacteriana",                   pharmacClass:"Penicilina" },
  { id:14, reference:"Azitromicina",    mechanism:"Inibe a síntese proteica bacteriana",                  pharmacClass:"Macrolídeo" },
  { id:15, reference:"Ciprofloxacino",  mechanism:"Inibe DNA girase bacteriana",                          pharmacClass:"Fluoroquinolona" },
  { id:16, reference:"Fluconazol",      mechanism:"Inibe síntese de ergosterol fúngico",                  pharmacClass:"Antifúngico azólico" },
  { id:17, reference:"Aciclovir",       mechanism:"Inibe replicação do DNA viral",                        pharmacClass:"Antiviral" },
  { id:18, reference:"Salbutamol",      mechanism:"Estimula receptores beta-2 adrenérgicos",              pharmacClass:"Broncodilatador beta-2 agonista" },
  { id:19, reference:"Budesonida",      mechanism:"Reduz resposta inflamatória das vias aéreas",          pharmacClass:"Corticosteroide inalatório" },
  { id:20, reference:"Sinvastatina",    mechanism:"Inibe a enzima HMG-CoA redutase",                      pharmacClass:"Estatina" },
  { id:21, reference:"Clopidogrel",     mechanism:"Inibe agregação plaquetária via receptor P2Y12",      pharmacClass:"Antiagregante plaquetário" },
  { id:22, reference:"Heparina",        mechanism:"Potencializa ação da antitrombina III",                pharmacClass:"Anticoagulante" },
  { id:23, reference:"Furosemida",      mechanism:"Inibe cotransportador Na+/K+/2Cl-",                    pharmacClass:"Diurético de alça" },
  { id:24, reference:"Hidroclorotiazida", mechanism:"Inibe reabsorção de sódio no túbulo distal",         pharmacClass:"Diurético tiazídico" }
];

const cardsContainer = document.getElementById("cards-container");
const columns        = document.querySelectorAll(".column");
const result         = document.getElementById("result");

let draggedCard  = null;
let ghostEl      = null;   // mobile ghost clone
let currentRound = [];     // 4 itens ativos na rodada

/* ─── Sorteia 4 itens sem repetir entre rodadas consecutivas ── */
let lastRoundIds = [];

function pickRound() {
  const pool     = data.filter(item => !lastRoundIds.includes(item.id));
  const source   = pool.length >= 4 ? pool : data; // fallback se pool esgotado
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  currentRound   = shuffled.slice(0, 4);
  lastRoundIds   = currentRound.map(i => i.id);
}

/* ─── Helpers ───────────────────────────────────────────────── */
function getDropTarget(x, y) {
  if (ghostEl) ghostEl.style.display = "none";
  const el = document.elementFromPoint(x, y);
  if (ghostEl) ghostEl.style.display = "";

  if (!el) return null;
  if (el === cardsContainer || cardsContainer.contains(el)) return cardsContainer;
  const col = el.closest(".column");
  return col || null;
}

function setDragOver(target) {
  document.querySelectorAll(".drag-over").forEach(e => e.classList.remove("drag-over"));
  if (target) target.classList.add("drag-over");
}

function dropInto(target) {
  if (!draggedCard || !target) return;
  target.appendChild(draggedCard);
  draggedCard.classList.remove("dragging");
  draggedCard = null;
  document.querySelectorAll(".drag-over").forEach(e => e.classList.remove("drag-over"));
}

/* ─── Card factory ──────────────────────────────────────────── */
function createCards() {
  let cards = [];

  currentRound.forEach(item => {
    cards.push({ pairId: item.id, text: item.reference,    type: "ref"   });
    cards.push({ pairId: item.id, text: item.mechanism,    type: "mech"  });
    cards.push({ pairId: item.id, text: item.pharmacClass, type: "class" });
  });

  cards.sort(() => Math.random() - 0.5);

  cards.forEach(cardData => {
    const card = document.createElement("div");
    card.classList.add("card", cardData.type);
    card.dataset.id   = cardData.pairId;
    card.dataset.type = cardData.type;
    card.textContent  = cardData.text;

    /* ── Mouse drag ── */
    card.draggable = true;

    card.addEventListener("dragstart", () => {
      draggedCard = card;
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      document.querySelectorAll(".drag-over").forEach(e => e.classList.remove("drag-over"));
    });

    /* ── Touch drag ── */
    card.addEventListener("touchstart", handleTouchStart, { passive: true });

    cardsContainer.appendChild(card);
  });
}

/* ─── Mouse drop targets ────────────────────────────────────── */
[...columns, cardsContainer].forEach(zone => {
  zone.addEventListener("dragover", e => {
    e.preventDefault();
    setDragOver(zone);
  });
  zone.addEventListener("dragleave", e => {
    if (!zone.contains(e.relatedTarget)) {
      zone.classList.remove("drag-over");
    }
  });
  zone.addEventListener("drop", () => dropInto(zone));
});

/* ─── Touch handlers ────────────────────────────────────────── */
function handleTouchStart(e) {
  draggedCard = e.currentTarget;
  draggedCard.classList.add("dragging");

  const touch  = e.touches[0];
  const rect   = draggedCard.getBoundingClientRect();

  const offsetX = touch.clientX - rect.left;
  const offsetY = touch.clientY - rect.top;

  ghostEl = draggedCard.cloneNode(true);
  ghostEl.classList.add("card-ghost");
  ghostEl.style.width  = rect.width  + "px";
  ghostEl.style.height = rect.height + "px";
  ghostEl.style.left   = rect.left   + "px";
  ghostEl.style.top    = rect.top    + "px";
  document.body.appendChild(ghostEl);

  function handleTouchMove(ev) {
    ev.preventDefault();
    const t = ev.touches[0];
    ghostEl.style.left = (t.clientX - offsetX) + "px";
    ghostEl.style.top  = (t.clientY - offsetY) + "px";

    const target = getDropTarget(t.clientX, t.clientY);
    setDragOver(target);
  }

  function handleTouchEnd(ev) {
    const t      = ev.changedTouches[0];
    const target = getDropTarget(t.clientX, t.clientY);

    ghostEl.remove();
    ghostEl = null;

    dropInto(target || cardsContainer); // fall back to deck

    document.removeEventListener("touchmove",  handleTouchMove);
    document.removeEventListener("touchend",   handleTouchEnd);
  }

  document.addEventListener("touchmove",  handleTouchMove, { passive: false });
  document.addEventListener("touchend",   handleTouchEnd);
}

/* ─── Verify / New game button ───────────────────────────────── */
const checkBtn = document.getElementById("check-btn");

function resetGame() {
  // Limpa cartas de todas as colunas e do deck
  [...columns, cardsContainer].forEach(zone => {
    zone.querySelectorAll(".card").forEach(c => c.remove());
    zone.style.borderColor = "";
    zone.style.boxShadow   = "";
  });

  result.textContent      = "";
  checkBtn.textContent    = "Verificar combinações";
  checkBtn.dataset.mode   = "check";

  pickRound();
  createCards();
}

checkBtn.dataset.mode = "check";

checkBtn.addEventListener("click", () => {

  if (checkBtn.dataset.mode === "new") {
    resetGame();
    return;
  }

  let correct = 0;

  columns.forEach(column => {
    const cards = [...column.querySelectorAll(".card")];

    if (cards.length === 3) {
      const ids   = cards.map(c => c.dataset.id);
      const types = cards.map(c => c.dataset.type);

      const sameId      = ids.every(id => id === ids[0]);
      const hasAllTypes =
        types.includes("ref") &&
        types.includes("mech") &&
        types.includes("class");

      if (sameId && hasAllTypes) {
        correct++;
        column.style.borderColor = "#10b981";
        column.style.boxShadow   = "0 0 25px rgba(16,185,129,.5)";
      } else {
        column.style.borderColor = "#ef4444";
        column.style.boxShadow   = "0 0 25px rgba(239,68,68,.5)";
      }
    } else {
      column.style.borderColor = "";
      column.style.boxShadow   = "";
    }
  });

  result.textContent = `Você completou ${correct} combinação(ões) correta(s)!`;

  if (correct === currentRound.length) {
      result.innerHTML += `
    <img 
      src="assets/trophy.png" 
      class="win-icon"
      alt="Vitória"
    >
  `;
    checkBtn.textContent    = "Jogar nova partida";
    checkBtn.dataset.mode   = "new";
  }
});

pickRound();
createCards();