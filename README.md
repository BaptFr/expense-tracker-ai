# 💶 Expensely

Un tracker de dépenses personnelles, 100 % côté client et pour moi une mise en pratique sur les différentes façons de **construire un produit aidé d'un agent IA (Claude Code)**.

**🇫🇷 [Français](#francais) · 🇬🇧 [English](#english)**

<div align="center">
  <img src="https://i.imgur.com/asMtnkB.gif" width="500px" />
</div>
---

<a id="francais"></a>

## 🇫🇷 Français

### 👨‍💻​ Pourquoi ce projet ? 

C'est un projet pour explorer comment diriger efficacement un agent de code IA autonome sur un vrai produit, bien au-delà de simplement « demander du code ». Chaque fonctionnalité teste et valide une méthodologie différente :

- Implémentations concurrentes : trois versions complètement différentes d'une même feature, développées en parallèle sur des branches séparées, puis analysées et fusionnées pour conserver ce que chacune apportait de meilleur.
- Développement parallèle multi-agent : orchestration de plusieurs agents Claude Code indépendants via Git worktrees (branche + dossier de travail isolés) pour éviter les conflits et valider la scalabilité du workflow.
- Sketch-to-code : interprétation directe de croquis papier photographiés pour extraire la structure avant implémentation, testant la capacité de l'IA à "lire" les intentions visuelles.
- Localisation complète : migration exhaustive de l'interface et du contenu généré (EN→FR, USD→EUR) avec validation visuelle réelle dans le navigateur après chaque batch.
- Commandes slash sur-mesure : capture de workflows répétables spécifiques au projet dans .claude/commands/ pour industrialiser les patterns qui fonctionnent.
- Documentation vivante : fichier CLAUDE.md documentant les vraies conventions du code (flux de données, palette de couleurs, absence de suite de tests) pour garantir la cohérence entre les sessions IA futures.

### Quel projet ?

Expensely est une application Next.js qui permet de suivre ses dépenses : ajout, édition, filtres, graphiques, exports multi-formats, analyses par catégorie et par marchand. Aucune donnée ne quitte le navigateur. Tout est pour l'instant stocké dans le `localStorage`, il n'y a ni base de données, ni API. Ce n'était pour l'instant pas le but de ce développement et permet de maintenir l'app reste rapide, privée, et déployable n'importe où sans infrastructure.

L'interface est entièrement en français et les montants en euros.

### Fonctionnalités

- **Tableau de bord** : vue d'ensemble, tendance sur 6 mois, répartition par catégorie.
- **Dépenses** : CRUD complet avec recherche, filtres (dates, catégories), tri.
- **Aperçu mensuel** : diagramme circulaire (Camembert) de répartition + une « série budget » (jours consécutifs en dessous de la moyenne de dépense quotidienne établie).
- **Top catégories** / **Top dépenses** : classements dérivés des mêmes données (valeurs et pourcentages), top dépenses et top catégories de dépenses.
- **Export** - Deux façons complémentaires d'exporter : un panneau rapide (CSV / JSON / PDF, filtré) directement depuis le tableau de bord, et un **Centre d'export** dédié avec modèles prêts à l'emploi (rapport fiscal, résumé mensuel, analyse par catégorie, sauvegarde complète), envoi par e-mail, lien de partage avec QR code, synchronisation cloud et planification de sauvegardes automatiques.
- Les intégrations cloud (Google Sheets, Dropbox, OneDrive) et l'envoi d'e-mail sont **simulées et explicitement annoncées comme telles**  en haut dans l'interface ( pour l'instant pas de service tiers réellement contacté).

### Comment ça a été construit - la partie IA

Quelques étapes notables de la construction de ce projet à l'aide de Claude Code :

- **Trois implémentations concurrentes de la même fonctionnalité.** Plutôt que de choisir directement une approche pour l'export de données, trois versions complètement différentes ont été développées côte à côte sur des branches séparées : un simple bouton CSV, un panneau avancé avec filtres et multi-formats, et un « Export Center » façon SaaS avec intégrations simulées. Une analyse comparative a documenté l'architecture, la complexité et les compromis de chacune avant de les fusionner en un seul produit cohérent, en conservant ce que chaque version apportait de complémentaire plutôt qu'en en jetant deux sur trois.
- **Développement en parallèle via des worktrees Git + plusieurs agents autonomes.** Les écrans « Top catégories » et « Top marchands » ont été développés simultanément par deux agents Claude Code indépendants, chacun dans son propre worktree Git isolé (branche + dossier de travail séparés), pour éviter tout conflit pendant le développement - avec fusion et résolution des conflits (inévitables sur `NavBar.tsx`) une fois le travail terminé.
- **D'un croquis papier à un composant fonctionnel.** L'écran « Aperçu mensuel » (donut chart + série budget) est parti d'un croquis dessiné à la main sur un coin de table, pris en photo puis directement interprété pour en extraire la structure, avant implémentation avec la palette de couleurs déjà validée du projet.
- **Une passe de localisation complète.** Tous les textes visibles par l'utilisateur - labels, messages d'erreur, toasts, contenus des PDF/CSV générés, formats de date - sont passés de l'anglais/dollar au français/euro, catégorie par catégorie de composants, avec vérification visuelle systématique dans un vrai navigateur après chaque lot.
- **Des commandes slash sur-mesure** (`.claude/commands/`) capturant des workflows répétables propres à ce projet : revue de code, scaffolding d'un nouvel écran, orchestration d'agents en parallèle.
- **Un fichier `CLAUDE.md`** documentant les conventions réelles du code (flux de données, palette de couleurs, absence de suite de tests) pour que les futures sessions IA restent cohérentes avec l'existant plutôt que de réinventer des patterns.

À chaque étape, le travail a été vérifié concrètement : typecheck, lint, build, et un vrai passage dans un navigateur piloté automatiquement (pas seulement la compilation).

---

<a id="english"></a>

## 🇬🇧 English

### 👨‍💻​ Why this project?

This is a project to explore how to effectively direct an autonomous AI code agent on a real product, going far beyond simply "asking for code". Each feature tests and validates a different methodology:

- **Competing implementations**: three completely different versions of the same feature, developed in parallel on separate branches, then analyzed and merged to preserve what each brought uniquely.
- **Parallel multi-agent development**: orchestration of several independent Claude Code agents via Git worktrees (separate branch + isolated working directory) to avoid conflicts and validate workflow scalability.
- **Sketch-to-code**: direct interpretation of hand-drawn sketches photographed to extract structure before implementation, testing the AI's ability to "read" visual intentions.
- **Complete localization**: exhaustive migration of the interface and generated content (FR→EN, EUR→USD) with real visual validation in the browser after each batch.
- **Custom slash commands**: capture of repeatable workflows specific to the project in `.claude/commands/` to industrialize patterns that work.
- **Living documentation**: `CLAUDE.md` file documenting actual code conventions (data flow, color palette, absence of test suite) to ensure consistency across future AI sessions.

At each step, work is verified for real: typecheck, lint, build, and actual browser passes driven end-to-end (not just compilation).

### What is this?

Expensely is a Next.js application that lets you track expenses: add, edit, filter, visualize with charts, export in multiple formats, and analyze by category and vendor. No data ever leaves the browser. Everything is currently stored in `localStorage` — there's no database and no API. This wasn't the goal of this development effort, and it keeps the app fast, private, and deployable anywhere without infrastructure.

The interface is entirely in French and amounts are in euros.

### Features

- **Dashboard**: snapshot view, 6-month trend, category breakdown.
- **Expenses**: full CRUD with search, filters (date range, categories), sorting.
- **Monthly Insights**: a spending donut chart plus a "budget streak" (consecutive days spent at or under your own recent daily average).
- **Top Categories** / **Top Vendors**: rankings derived from the same data (values and percentages), top expenses and top spending categories.
- **Export**: two complementary ways to get your data out: a quick filtered panel (CSV / JSON / PDF) right from the dashboard, and a dedicated **Export Center** with ready-made templates (tax report, monthly summary, category analysis, full backup), email delivery, shareable link with QR code, cloud sync, and scheduled automatic backups.
- Cloud integrations (Google Sheets, Dropbox, OneDrive) and email sending are **simulated and explicitly labeled as such** at the top of the interface (no third-party service actually contacted for now).

### How it was built — the AI story

A few notable steps from building this project with Claude Code:

- **Three competing implementations of the same feature.** Rather than picking one approach for data export upfront, three genuinely different versions were built side by side on separate branches: a plain CSV button, an advanced multi-format panel with filtering, and a SaaS-style "Export Center" with simulated integrations. A comparative analysis documented each one's architecture, complexity, and trade-offs before merging all three into one coherent product — keeping what each version uniquely offered rather than throwing two out of three away.
- **Parallel development via Git worktrees and multiple autonomous agents.** The "Top Categories" and "Top Vendors" screens were built simultaneously by two independent Claude Code agents, each working in its own isolated Git worktree (separate branch + separate working directory) to avoid stepping on each other mid-development — merged and reconciled (with the expected, trivial `NavBar.tsx` conflict) once both were done.
- **From a napkin sketch to a working component.** The "Monthly Insights" screen (donut chart + budget streak) started as a hand-drawn sketch, photographed and interpreted directly to extract its structure, then implemented against the project's already-validated color palette.
- **A complete localization pass.** Every user-facing string — labels, error messages, toasts, generated PDF/CSV content, date formats — was moved from French/euro to English/dollar, component group by component group, with real-browser visual checks after each batch.
- **Project-specific slash commands** (`.claude/commands/`) capturing repeatable workflows for this codebase: code review, scaffolding a new screen, orchestrating parallel agents.
- **A `CLAUDE.md` file** documenting the actual code conventions (data flow, color palette, absence of test suite) so future AI-assisted sessions stay consistent with what's already there instead of reinventing patterns.

At each step, work was verified for real: typecheck, lint, build, and actual browser passes driven end-to-end — not just "it compiles."
