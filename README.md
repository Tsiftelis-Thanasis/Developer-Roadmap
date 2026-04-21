# 🧠 Developer Roadmap — Interactive Learning App

Το προσωπικό σου interactive roadmap για να γίνεις full-stack developer!  
.NET 10 → TypeScript / Next.js → Kotlin

## 🚀 Τοπική Εκτέλεση

### Προαπαιτούμενα
- **Node.js** (v18+): https://nodejs.org

### Βήματα
```bash
cd roadmap-app
npm install
npm run dev
```
Ανοίγει στο **http://localhost:3000** 🎉

---

## 📤 Ανέβασμα στο GitHub

### 1. Δημιούργησε GitHub repo
Πήγαινε στο https://github.com/new και φτιάξε ένα νέο repository (π.χ. `developer-roadmap`).

### 2. Push τον κώδικα
```bash
cd roadmap-app
git init
git add .
git commit -m "🚀 Initial commit — Developer Roadmap"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/developer-roadmap.git
git push -u origin main
```
> Αντικατέστησε `YOURUSERNAME` με το GitHub username σου.

---

## ☁️ Deploy σε Azure Static Web Apps (ΔΩΡΕΑΝ!)

### Μέθοδος 1: Μέσω Azure Portal (πιο εύκολο)

**Βήμα 1** — Πήγαινε στο https://portal.azure.com  
**Βήμα 2** — Ψάξε "Static Web Apps" → Create  
**Βήμα 3** — Συμπλήρωσε:
- **Name**: `developer-roadmap`
- **Plan**: Free
- **Source**: GitHub
- **Organization**: Το GitHub account σου
- **Repository**: `developer-roadmap`
- **Branch**: `main`
- **Build Preset**: `Vite`
- **App location**: `/`
- **Output location**: `dist`

**Βήμα 4** — Πάτα "Review + Create" → "Create"  

Το Azure θα κάνει αυτόματα deploy κάθε φορά που κάνεις push στο `main`! 🎉

### Μέθοδος 2: Μέσω Azure CLI

```bash
# 1. Εγκατάστησε Azure CLI
# Windows: winget install Microsoft.AzureCLI
# Mac: brew install azure-cli

# 2. Login
az login

# 3. Δημιούργησε resource group (μόνο την πρώτη φορά)
az group create --name roadmap-rg --location westeurope

# 4. Δημιούργησε Static Web App
az staticwebapp create \
  --name developer-roadmap \
  --resource-group roadmap-rg \
  --source https://github.com/YOURUSERNAME/developer-roadmap \
  --location westeurope \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github

# 5. Πάρε το URL
az staticwebapp show \
  --name developer-roadmap \
  --resource-group roadmap-rg \
  --query "defaultHostname" -o tsv
```

### Μέθοδος 3: GitHub Actions (ήδη έτοιμο!)

Το αρχείο `.github/workflows/azure-deploy.yml` είναι ήδη στο project.  
Πρόσθεσε μόνο το deployment token:

1. Azure Portal → Static Web App → **Manage deployment token** → Copy
2. GitHub repo → **Settings** → **Secrets and variables** → **Actions** → New secret
3. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`, Value: paste the token
4. Push → Auto-deploy!

---

## 📱 Features

- ✅ **Persistent Progress** — αποθήκευση στο localStorage
- 💻 **Code Examples** — C# παραδείγματα με επεξήγηση
- 🚶 **Walkthroughs** — βήμα-βήμα οδηγοί
- ❓ **Quizzes** — ερωτήσεις κατανόησης
- ✏️ **Live Editor** — AI code review (προαιρετικό API key)

## 📁 Δομή Αρχείων

```
roadmap-app/
├── .github/workflows/
│   └── azure-deploy.yml       # CI/CD pipeline
├── src/
│   ├── main.jsx               # Entry + localStorage polyfill
│   └── App.jsx                # Κύριο component
├── index.html                 # HTML entry
├── package.json               # Dependencies
├── vite.config.js             # Vite config
├── staticwebapp.config.json   # Azure SWA routing
├── .gitignore                 # Git ignore rules
└── README.md
```

---
Φτιαγμένο με ❤️ μέσω Claude AI
