# 💶 Expensely
<h2 align="center"> <a href="https://baptfr.github.io/expense-tracker-ai/"> 👉 Accéder au site 👈 </a>  </h2>
Un tracker de dépenses personnelles, 100 % côté client et pour moi une mise en pratique sur les différentes façons de **construire un produit aidé d'un agent IA (Claude Code)**.

**[Français](#francais)  /   [English](#english)**

<div align="center">
<img src="https://i.imgur.com/pZclztw.gif" width="1000px"/>
</div>

---

<a id="francais"></a>

## Français

### 👨‍💻​ Pourquoi ce projet ?

Ce projet avait pour but d'explorer les façons de diriger efficacement un agent de code IA autonome sur un vrai produit, bien au-delà de simplement « demander du code ». Chaque fonctionnalité teste et valide une méthodologie différente :

- **De l'idée au code**, sous une forme différente du texte. Les architectures logicielles et conceptions sont exprimées sous formes de schémas etn on de texte. Il a donc été important d'utiliser cette forme de communication avec l'agent.  Le Sketch-to-code a permis l'interprétation directe d'un croquis papier photographié et fournit à un agent pour qu'il en extrait la structure avant implémentation, testant la capacité de l'IA à "lire" des intentions visuelles d'un dessin.
- **Optimisations des fonctionnalités** de l'application par implémentations concurrentes : Concrètement, trois versions différentes d'une même feature, développées en parallèle sur des branches séparées, puis analysées et fusionnées pour conserver ce que chacune apportait de meilleur.
- **Orchestration pour développement parallèle multi-agent** : orchestration de plusieurs agents Claude Code indépendants via Git worktrees (branche + dossier de travail isolés) pour éviter les conflits et valider la scalabilité du workflow.
- **Combler le fossé entre le raisonnement textuel et la perception visuelle (element grounding / visual anchoring)** :  Permet notamment de valider le code front-end en le confrontant au rendu visuel attendu. Lors de la migration d'une interface et de son contenu, l'agent IA effectue  une validation visuelle réelle directement dans le navigateur, après chaque lot de modifications, confirmant l'attendu (texte) avec le rendu visuel.
- **Commandes sur mesure standardisées** : capture de workflows répétables spécifiques au projet dans ".claude/commands/" pour industrialiser les patterns qui fonctionnent.
- Documentation vivante : fichier CLAUDE.md documentant les conventions du code (flux de données, palette de couleurs ...) pour garantir la cohérence entre les sessions d'utilisation ainsi qu'un suivi documenté.


Pour plus de détails [Construction détaillées](#-construction-détaillées---la-partie-ia)

### 💶​​ L'Appli

Expensely est une application Next.js qui permet de suivre ses dépenses : ajout, édition, filtres, graphiques, exports multi-formats, analyses par catégorie et par marchand. Aucune donnée ne quitte le navigateur. Tout est pour l'instant stocké dans le `localStorage`, il n'y a ni base de données, ni API. Ce n'était pour l'instant pas le but de ce développement et permet de maintenir l'app reste rapide, privée, et déployable n'importe où sans infrastructure.

L'interface est entièrement en français et les montants en euros.

### 🖱️ Fonctionnalités

- **Tableau de bord** : vue d'ensemble, tendance sur 6 mois, répartition par catégorie.
- **Dépenses** : CRUD complet avec recherche, filtres (dates, catégories), tri.
- **Aperçu mensuel** : diagramme circulaire (Camembert) de répartition + une « série budget » (jours consécutifs en dessous de la moyenne de dépense quotidienne établie).
- **Top catégories** / **Top dépenses** : classements dérivés des mêmes données (valeurs et pourcentages), top dépenses et top catégories de dépenses.
- **Export** - Deux façons complémentaires d'exporter : un panneau rapide (CSV / JSON / PDF, filtré) directement depuis le tableau de bord, et un **Centre d'export** dédié avec modèles prêts à l'emploi (rapport fiscal, résumé mensuel, analyse par catégorie, sauvegarde complète), envoi par e-mail, lien de partage avec QR code, synchronisation cloud et planification de sauvegardes automatiques.
- Les intégrations cloud (Google Sheets, Dropbox, OneDrive) et l'envoi d'e-mail sont **simulées et explicitement annoncées comme telles**  en haut dans l'interface ( pour l'instant pas de service tiers réellement contacté).

### 🤖​ Construction détaillées - la partie IA


<div align="center">
<img src="https://cleverhack.com/img/clawd.gif"/>
</div>

Voici quelques étapes notables, plus détaillées, de la construction de ce projet à l'aide de Claude Code :

- **Trois implémentations concurrentes de la même fonctionnalité.** Plutôt que de choisir directement une approche pour l'export de données, trois versions complètementaires différentes ont été développées côte à côte sur des branches séparées : un simple bouton CSV, un panneau avancé avec filtres et multi-formats, et un « Export Center » façon SaaS avec intégrations simulées. Une analyse comparative a documenté l'architecture, la complexité et les compromis de chacune avant de les fusionner en un seul produit cohérent, en conservant ce que chaque version apportait de complémentaire plutôt qu'en en jetant deux sur trois.
- **Développement en parallèle via des worktrees Git + plusieurs agents autonomes.** Les écrans « Top catégories » et « Top marchands » ont été développés simultanément par deux agents Claude Code indépendants, chacun dans son propre worktree Git isolé (branche + dossier de travail séparés), pour éviter tout conflit pendant le développement - avec fusion et résolution des conflits (inévitables sur `NavBar.tsx`) une fois le travail terminé.
- **D'un croquis papier à un composant fonctionnel.** L'écran « Aperçu mensuel » (donut chart + série budget) est parti d'un croquis dessiné à la main sur un coin de table, pris en photo puis directement interprété pour en extraire la structure, avant implémentation avec la palette de couleurs déjà validée du projet.
- **Une passe de localisation complète.** Tous les textes visibles par l'utilisateur - labels, messages d'erreur, toasts, contenus des PDF/CSV générés, formats de date - sont passés de l'anglais/dollar au français/euro, catégorie par catégorie de composants, avec vérification visuelle systématique dans un vrai navigateur après chaque lot.
- **Des commandes slash sur-mesure** (`.claude/commands/`) capturant des workflows répétables propres à ce projet : revue de code, scaffolding d'un nouvel écran, orchestration d'agents en parallèle.
- **Un fichier `CLAUDE.md`** documentant les conventions réelles du code (flux de données, palette de couleurs, absence de suite de tests) pour que les futures sessions IA restent cohérentes avec l'existant plutôt que de réinventer des patterns. Cela permet une cohérence et continuité du projet quelque soit les sessions.

À chaque étape, le travail a été vérifié concrètement : typecheck, lint, build, et un vrai passage dans un navigateur piloté automatiquement (pas seulement la compilation).

---

<a id="english"></a>

## English

### 👨‍💻 Why this project?

This project set out to explore how to effectively direct an autonomous AI coding agent on a real product, going well beyond simply "asking for code". Each feature tests and validates a different methodology:

- **From idea to code, in a form other than text.** Software architectures and designs are expressed as diagrams rather than text, so it was important to use that same form of communication with the agent. Sketch-to-code allowed direct interpretation of a photographed paper sketch: the agent extracts its structure before implementation, testing the AI's ability to "read" the visual intent of a drawing.
- **Feature optimization through competing implementations.** Concretely, three different versions of the same feature were developed in parallel on separate branches, then analyzed and merged to keep the best of what each one offered.
- **Multi-agent parallel development orchestration.** Several independent Claude Code agents are orchestrated through Git worktrees (isolated branch + working directory) to avoid conflicts and validate the workflow's scalability.
- **Bridging the gap between textual reasoning and visual perception (element grounding / visual anchoring).** Front-end code is validated against the expected visual rendering. During the migration of an interface and its content, the AI agent performs real visual validation directly in the browser after each batch of changes, checking the expected result (text) against the actual rendering.
- **Standardized custom commands.** Project-specific repeatable workflows are captured in `.claude/commands/` to industrialize the patterns that work.
- **Living documentation.** A `CLAUDE.md` file documents code conventions (data flow, color palette, etc.) to ensure consistency across sessions, along with documented tracking.

For more details, see [Detailed build - the AI part](#-detailed-build---the-ai-part)

### 💶 The App

Expensely is a Next.js app for tracking expenses: adding, editing, filtering, charts, multi-format exports, and analysis by category and by merchant. No data ever leaves the browser. Everything is currently stored in `localStorage`; there is no database and no API. That was not the goal of this development phase, and it keeps the app fast, private, and deployable anywhere without infrastructure.

The interface is entirely in French and amounts are in euros.

### 🖱️ Features

- **Dashboard**: overview, 6-month trend, breakdown by category.
- **Expenses**: full CRUD with search, filters (dates, categories), and sorting.
- **Monthly overview**: pie chart of the breakdown, plus a "budget streak" (consecutive days below the established average daily spending).
- **Top categories** / **Top expenses**: rankings derived from the same data (values and percentages), covering the largest expenses and the top spending categories.
- **Export**: two complementary ways to export. A quick panel (CSV / JSON / PDF, filtered) directly from the dashboard, and a dedicated **Export Center** with ready-made templates (tax report, monthly summary, category analysis, full backup), email delivery, a share link with QR code, cloud sync, and scheduled automatic backups.
- Cloud integrations (Google Sheets, Dropbox, OneDrive) and email sending are **simulated and explicitly labeled as such** at the top of the interface (no third-party service is actually contacted for now).

### 🤖 Detailed build - the AI part

<div align="center">
<img src="https://cleverhack.com/img/clawd.gif"/>
</div>

Here are some notable steps, in more detail, in building this project with Claude Code:

- **Three competing implementations of the same feature.** Rather than picking an approach for data export up front, three completely different versions were developed side by side on separate branches: a simple CSV button, an advanced panel with filters and multiple formats, and a SaaS-style "Export Center" with simulated integrations. A comparative analysis documented the architecture, complexity, and trade-offs of each before merging them into a single coherent product, keeping what each version contributed rather than discarding two out of three.
- **Parallel development via Git worktrees + multiple autonomous agents.** The "Top categories" and "Top merchants" screens were developed simultaneously by two independent Claude Code agents, each in its own isolated Git worktree (separate branch + working directory) to avoid any conflict during development, with merging and conflict resolution (unavoidable on `NavBar.tsx`) once the work was done.
- **From a paper sketch to a working component.** The "Monthly overview" screen (donut chart + budget streak) started from a hand-drawn sketch on the corner of a table, photographed and then directly interpreted to extract its structure, before implementation with the project's already-validated color palette.
- **A full localization pass.** All user-facing text (labels, error messages, toasts, generated PDF/CSV contents, date formats) was converted from English/dollars to French/euros, component category by component category, with systematic visual verification in a real browser after each batch.
- **Custom slash commands** (`.claude/commands/`) capturing repeatable project-specific workflows: code review, scaffolding a new screen, parallel agent orchestration.
- **A `CLAUDE.md` file** documenting the real code conventions (data flow, color palette, absence of a test suite) so that future AI sessions stay consistent with what exists instead of reinventing patterns. This provides consistency and continuity for the project across sessions.

At every step, the work was verified concretely: typecheck, lint, build, and a real pass through an automatically driven browser (not just compilation).
