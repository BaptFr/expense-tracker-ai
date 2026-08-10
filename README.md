# 💶 Expensely

Un tracker de dépenses personnelles, 100 % côté client, sans backend — et surtout, un **terrain d'expérimentation** sur les différentes façons de construire un produit avec un agent IA (Claude Code).

**🇫🇷 [Français](#francais) · 🇬🇧 [English](#english)**

---

<a id="francais"></a>

## 🇫🇷 Français

### C'est quoi ?

Expensely est une application Next.js qui permet de suivre ses dépenses : ajout, édition, filtres, graphiques, exports multi-formats, analyses par catégorie et par marchand. Aucune donnée ne quitte le navigateur — tout est stocké dans le `localStorage`, il n'y a ni base de données ni API. C'est un choix assumé : l'app reste rapide, privée, et déployable n'importe où sans infrastructure.

L'interface est entièrement en français et les montants en euros.

### Particularités du produit

- **Tableau de bord** — vue d'ensemble, tendance sur 6 mois, répartition par catégorie.
- **Dépenses** — CRUD complet avec recherche, filtres (dates, catégories), tri.
- **Aperçu mensuel** — donut chart de répartition + une « série budget » (jours consécutifs sous votre moyenne de dépense quotidienne).
- **Top catégories** / **Top dépenses** — classements dérivés des mêmes données (valeurs et pourcentages), top dépenses et top catégories de dépenses.
- **Export** — deux façons complémentaires d'exporter : un panneau rapide (CSV / JSON / PDF, filtré) directement depuis le tableau de bord, et un **Centre d'export** dédié avec modèles prêts à l'emploi (rapport fiscal, résumé mensuel, analyse par catégorie, sauvegarde complète), envoi par e-mail, lien de partage avec QR code, synchronisation cloud et planification de sauvegardes automatiques.
- Les intégrations cloud (Google Sheets, Dropbox, OneDrive) et l'envoi d'e-mail sont **simulées et explicitement annoncées comme telles** dans l'interface — pas de fausse promesse, pas de service tiers réellement contacté.

### Pourquoi ce projet

Ce repo n'est pas né d'un besoin réel de tracker de dépenses. C'est un projet pensé pour explorer, de bout en bout, **comment collaborer efficacement avec un agent de code IA** sur un vrai produit — pas juste « demander du code », mais tester différentes méthodologies de travail : comparaison d'approches concurrentes, développement parallèle, conception à partir d'un croquis, localisation complète, documentation du contexte projet pour les sessions futures, etc.

### Comment ça a été construit — la partie IA

Quelques épisodes notables de la construction de ce projet avec Claude Code :

- **Trois implémentations concurrentes de la même fonctionnalité.** Plutôt que de choisir directement une approche pour l'export de données, trois versions complètement différentes ont été développées côte à côte sur des branches séparées : un simple bouton CSV, un panneau avancé avec filtres et multi-formats, et un « Export Center » façon SaaS avec intégrations simulées. Une analyse comparative a documenté l'architecture, la complexité et les compromis de chacune avant de les fusionner en un seul produit cohérent, en conservant ce que chaque version apportait de complémentaire plutôt qu'en en jetant deux sur trois.
- **Développement en parallèle via des worktrees Git + plusieurs agents autonomes.** Les écrans « Top catégories » et « Top marchands » ont été développés simultanément par deux agents Claude Code indépendants, chacun dans son propre worktree Git isolé (branche + dossier de travail séparés), pour éviter tout conflit pendant le développement — avec fusion et résolution des conflits (inévitables sur `NavBar.tsx`) une fois le travail terminé.
- **D'un croquis papier à un composant fonctionnel.** L'écran « Aperçu mensuel » (donut chart + série budget) est parti d'un croquis dessiné à la main sur un coin de table, pris en photo puis directement interprété pour en extraire la structure, avant implémentation avec la palette de couleurs déjà validée du projet.
- **Une passe de localisation complète.** Tous les textes visibles par l'utilisateur — labels, messages d'erreur, toasts, contenus des PDF/CSV générés, formats de date — sont passés de l'anglais/dollar au français/euro, catégorie par catégorie de composants, avec vérification visuelle systématique dans un vrai navigateur après chaque lot.
- **Des commandes slash sur-mesure** (`.claude/commands/`) capturant des workflows répétables propres à ce projet : revue de code, scaffolding d'un nouvel écran, orchestration d'agents en parallèle.
- **Un fichier `CLAUDE.md`** documentant les conventions réelles du code (flux de données, palette de couleurs, absence de suite de tests) pour que les futures sessions IA restent cohérentes avec l'existant plutôt que de réinventer des patterns.

À chaque étape, le travail a été vérifié concrètement : typecheck, lint, build, et un vrai passage dans un navigateur piloté automatiquement (pas seulement « ça compile »).

### Stack technique

- **Next.js** (App Router) + **React** + **TypeScript**
- **Tailwind CSS** — pas de fichier de thème, palette de couleurs codée en dur et documentée dans `CLAUDE.md`
- Graphiques faits main en SVG/CSS — aucune librairie de charting
- `jsPDF` / `jspdf-autotable` pour l'export PDF, `qrcode` pour les QR codes de partage
- Aucune base de données, aucune API — persistance via `localStorage`

### Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production (inclut le typecheck + lint)
npm run lint
npx tsc --noEmit # typecheck seul, rapide
```

Il n'y a pas de suite de tests automatisés dans ce repo — la vérification passe par `tsc` + `lint` + `build`, complétés par des passages manuels/pilotés dans le navigateur.

### Statut

Projet de démonstration / portfolio, pas une application de gestion financière destinée à la production. Les données restent locales à votre navigateur ; les intégrations cloud sont simulées et clairement annoncées comme telles dans l'interface.

---

<a id="english"></a>

## 🇬🇧 English

### What is this?

Expensely is a Next.js expense tracker: add/edit expenses, filter and search, charts, multi-format export, category and vendor breakdowns. No data ever leaves the browser — everything is persisted in `localStorage`, there's no database and no API. That's a deliberate choice: the app stays fast, private, and deployable anywhere with zero infrastructure.

The UI itself is fully localized in French, with amounts in euros.

### Product highlights

- **Dashboard** — snapshot view, 6-month trend, category breakdown.
- **Expenses** — full CRUD with search, filters (date range, category), sorting.
- **Monthly Insights** — a spending donut chart plus a "budget streak" (consecutive days spent at or under your own recent daily average).
- **Top Categories** / **Top Vendors** — rankings derived from the same data; there's no dedicated "vendor" field in the model, so vendors are inferred from the free-text description.
- **Export** — two complementary ways to get your data out: a quick filtered panel (CSV / JSON / PDF) right from the dashboard, and a dedicated **Export Center** with ready-made templates (tax report, monthly summary, category analysis, full backup), email delivery, a shareable link with QR code, cloud sync, and scheduled automatic backups.
- Cloud integrations (Google Sheets, Dropbox, OneDrive) and email sending are **simulated and explicitly labeled as such** in the UI — no false promises, no third-party service actually contacted.

### Why this project exists

This repo wasn't born from an actual need for an expense tracker. It exists to explore, end-to-end, **how to work effectively with an AI coding agent** on a real product — not just "ask for code," but test different collaboration methodologies: comparing competing approaches, parallel development, sketch-to-code, full localization passes, documenting project context for future sessions, and so on.

### How it was built — the AI story

A few notable episodes from building this with Claude Code:

- **Three competing implementations of the same feature.** Rather than picking one approach for data export upfront, three genuinely different versions were built side by side on separate branches: a plain CSV button, an advanced multi-format panel with filtering, and a SaaS-style "Export Center" with simulated integrations. A comparative analysis documented each one's architecture, complexity, and trade-offs before merging all three into one coherent product — keeping what each version uniquely offered instead of throwing two out of three away.
- **Parallel development via Git worktrees and multiple autonomous agents.** The "Top Categories" and "Top Vendors" screens were built simultaneously by two independent Claude Code agents, each working in its own isolated Git worktree (separate branch + separate working directory) to avoid stepping on each other mid-development — merged and reconciled (with the expected, trivial `NavBar.tsx` conflict) once both were done.
- **From a napkin sketch to a working component.** The "Monthly Insights" screen (donut chart + budget streak) started life as a hand-drawn sketch, photographed and interpreted directly to extract its structure, then implemented against the project's already-validated color palette.
- **A full localization pass.** Every user-facing string — labels, error messages, toasts, generated PDF/CSV content, date formats — was moved from English/USD to French/EUR, component group by component group, with a real-browser visual check after each batch.
- **Project-specific slash commands** (`.claude/commands/`) capturing repeatable workflows for this codebase: code review, scaffolding a new screen, orchestrating parallel agents.
- **A `CLAUDE.md` file** documenting the codebase's actual conventions (data flow, color palette, absence of a test suite) so future AI-assisted sessions stay consistent with what's already there instead of reinventing patterns.

At every step, work was verified for real: typecheck, lint, build, and an actual browser pass driven end-to-end — not just "it compiles."

### Tech stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **Tailwind CSS** — no theme file; colors are hardcoded and documented in `CLAUDE.md`
- Hand-built SVG/CSS charts — no charting library
- `jsPDF` / `jspdf-autotable` for PDF export, `qrcode` for share-link QR codes
- No database, no API — persistence via `localStorage`

### Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (runs typecheck + lint too)
npm run lint
npx tsc --noEmit # typecheck only, fast
```

There's no automated test suite in this repo — correctness is checked via `tsc` + `lint` + `build`, backed up by manual/driven browser passes.

### Status

A demo/portfolio project, not production financial software. Data stays local to your browser; cloud integrations are simulated and clearly labeled as such in the UI.
