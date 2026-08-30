const phoneInput = document.getElementById("phoneInput");
const checkButton = document.getElementById("checkButton");
const result = document.getElementById("result");
const errorBox = document.getElementById("error");
const operatorName = document.getElementById("operatorName");
const normalizedNumber = document.getElementById("normalizedNumber");
const resultBadge = document.getElementById("resultBadge");
const year = document.getElementById("year");

year.textContent = new Date().getFullYear();

/*
 * ============================================================
 * CONFIGURATION
 * ============================================================
 *
 * Le site fonctionne immédiatement en MODE DÉMO avec la base
 * locale ci-dessous.
 *
 * Pour connecter ton vrai backend/API, remplace DEMO_MODE par
 * false et renseigne API_URL.
 */

const DEMO_MODE = true;
const API_URL = "http://localhost:3000/api/operator";

/*
 * Préfixes d'origine estimés.
 * Comme pour ton bot Discord, cela ne garantit pas l'opérateur
 * actuel si le numéro a été porté.
 */
const PREFIXES = {
  "Orange": [
    "0607", "0608", "0610", "0611", "0612", "0613", "0614",
    "0620", "0621", "0622", "0623", "0624", "0625",
    "0630", "0631", "0632", "0633",
    "0637", "0638", "0639",
    "0642", "0643", "0645", "0647", "0648",
    "0654",
    "0670", "0671", "0672", "0673", "0674", "0675",
    "0676", "0677", "0678", "0679",
    "0680", "0681", "0682", "0683", "0684", "0685",
    "0686", "0687", "0688", "0689",
    "0690", "0693", "0696", "0697"
  ],

  "SFR": [
    "0601", "0603", "0604", "0609",
    "0615", "0616", "0617", "0618", "0619",
    "0626", "0627", "0628", "0629",
    "0634", "0635",
    "0646",
    "0655", "0656", "0657",
    "0692",
    "0709",
    "0750",
    "0776", "0777", "0778", "0779"
  ],

  "Bouygues Telecom": [],
  "Free Mobile": []
};

function normalizePhone(value) {
  let phone = value.replace(/[^\d+]/g, "");

  if (phone.startsWith("+33")) {
    phone = "0" + phone.slice(3);
  } else if (phone.startsWith("0033")) {
    phone = "0" + phone.slice(4);
  }

  if (!/^\d{10}$/.test(phone)) return null;
  if (!phone.startsWith("06") && !phone.startsWith("07")) return null;

  return phone;
}

function findOperator(phone) {
  const prefix = phone.slice(0, 4);

  for (const [operator, prefixes] of Object.entries(PREFIXES)) {
    if (prefixes.includes(prefix)) {
      return operator;
    }
  }

  return null;
}

function formatPhone(phone) {
  return phone.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

function showError(message) {
  errorBox.textContent = "⚠️ " + message;
  errorBox.classList.remove("hidden");
  result.classList.add("hidden");
}

function showResult(operator, phone) {
  errorBox.classList.add("hidden");
  result.classList.remove("hidden");

  operatorName.textContent = operator || "Inconnu";
  normalizedNumber.textContent = formatPhone(phone);

  if (operator) {
    resultBadge.textContent = "Trouvé";
    resultBadge.style.color = "#6ee7a8";
    resultBadge.style.background = "rgba(57,217,138,.1)";
  } else {
    resultBadge.textContent = "Inconnu";
    resultBadge.style.color = "#fbbf24";
    resultBadge.style.background = "rgba(251,191,36,.1)";
  }
}

async function checkNumber() {
  const value = phoneInput.value.trim();

  if (!value) {
    showError("Entre un numéro de téléphone.");
    return;
  }

  const phone = normalizePhone(value);

  if (!phone) {
    showError("Numéro mobile français invalide. Utilise un numéro en 06 ou 07.");
    return;
  }

  checkButton.classList.add("loading");
  checkButton.querySelector("span").textContent = "Recherche…";

  try {
    if (DEMO_MODE) {
      // Petit délai pour rendre l'expérience plus naturelle.
      await new Promise(resolve => setTimeout(resolve, 450));

      const operator = findOperator(phone);
      showResult(operator, phone);
    } else {
      const response = await fetch(
        `${API_URL}?phone=${encodeURIComponent(phone)}`,
        {
          method: "GET",
          headers: {
            "Accept": "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error("Le serveur de vérification est indisponible.");
      }

      const data = await response.json();

      if (!data.operator) {
        showResult(null, phone);
      } else {
        showResult(data.operator, phone);
      }
    }
  } catch (error) {
    showError(error.message || "Une erreur est survenue.");
  } finally {
    checkButton.classList.remove("loading");
    checkButton.querySelector("span").textContent = "Vérifier";
  }
}

checkButton.addEventListener("click", checkNumber);

phoneInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    checkNumber();
  }
});

// Formatage léger pendant la saisie.
phoneInput.addEventListener("input", () => {
  const raw = phoneInput.value;

  if (raw.startsWith("+33") || raw.startsWith("0033")) {
    return;
  }

  const digits = raw.replace(/\D/g, "").slice(0, 10);

  if (digits.length >= 3) {
    phoneInput.value = digits.replace(
      /(\d{2})(\d{2})(\d{2})(\d{2})(\d{0,2})/,
      (_, a, b, c, d, e) =>
        [a, b, c, d, e].filter(Boolean).join(" ")
    );
  }
});

document.getElementById("discordButton").addEventListener("click", () => {
  window.location.href = "https://discord.com/oauth2/authorize?client_id=1543454119967195258";
});