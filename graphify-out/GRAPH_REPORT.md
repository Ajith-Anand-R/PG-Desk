# Graph Report - PG Desk  (2026-06-09)

## Corpus Check
- 75 files · ~76,795 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 502 nodes · 533 edges · 66 communities (44 shown, 22 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8380d41d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Agent System Documentation|Agent System Documentation]]
- [[_COMMUNITY_Bookings & Expenses Management|Bookings & Expenses Management]]
- [[_COMMUNITY_Graphify Lifecycle Update|Graphify Lifecycle Update]]
- [[_COMMUNITY_Aliases Tailwind Hooks|Aliases Tailwind Hooks]]
- [[_COMMUNITY_3D Graphics Scene|3D Graphics Scene]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Linter Settings|Linter Settings]]
- [[_COMMUNITY_Graphify Lifecycle Update|Graphify Lifecycle Update]]
- [[_COMMUNITY_Graphify Lifecycle Update|Graphify Lifecycle Update]]
- [[_COMMUNITY_Page Tenant Terms|Page Tenant Terms]]
- [[_COMMUNITY_Rooms & Staff View|Rooms & Staff View]]
- [[_COMMUNITY_Graphify Knowledge Graph|Graphify Knowledge Graph]]
- [[_COMMUNITY_3D Graphics Scene|3D Graphics Scene]]
- [[_COMMUNITY_Graphify Lifecycle Update|Graphify Lifecycle Update]]
- [[_COMMUNITY_Graphify Lifecycle Update|Graphify Lifecycle Update]]
- [[_COMMUNITY_Graphify Lifecycle Update|Graphify Lifecycle Update]]
- [[_COMMUNITY_Property Selector Bottom|Property Selector Bottom]]
- [[_COMMUNITY_Graphify Lifecycle Update|Graphify Lifecycle Update]]
- [[_COMMUNITY_Change Password Changepasswordview|Change Password Changepasswordview]]
- [[_COMMUNITY_Receipts & Reminders|Receipts & Reminders]]
- [[_COMMUNITY_Readme Deploy Vercel|Readme Deploy Vercel]]
- [[_COMMUNITY_Bank Details Bankdetails|Bank Details Bankdetails]]
- [[_COMMUNITY_Bills Billsview Billsviewprops|Bills Billsview Billsviewprops]]
- [[_COMMUNITY_Notifications Notificationitem Notificationsview|Notifications Notificationitem Notificationsview]]
- [[_COMMUNITY_Receipts & Reminders|Receipts & Reminders]]
- [[_COMMUNITY_Support & Terms View|Support & Terms View]]
- [[_COMMUNITY_Wallet Transaction Walletview|Wallet Transaction Walletview]]
- [[_COMMUNITY_Graphify Lifecycle Update|Graphify Lifecycle Update]]
- [[_COMMUNITY_Graphify Knowledge Graph|Graphify Knowledge Graph]]
- [[_COMMUNITY_3D Graphics Scene|3D Graphics Scene]]
- [[_COMMUNITY_Claude Settings Hooks|Claude Settings Hooks]]
- [[_COMMUNITY_Hooks Codex Pretooluse|Hooks Codex Pretooluse]]
- [[_COMMUNITY_Create Property Createpropertyview|Create Property Createpropertyview]]
- [[_COMMUNITY_Profile Profileview Profileviewprops|Profile Profileview Profileviewprops]]
- [[_COMMUNITY_Property Modal Propertyqrmodal|Property Modal Propertyqrmodal]]
- [[_COMMUNITY_Referral Referralview Referralviewprops|Referral Referralview Referralviewprops]]
- [[_COMMUNITY_Settings Settingsview Settingsviewprops|Settings Settingsview Settingsviewprops]]
- [[_COMMUNITY_Subscription Subscriptionview Subscriptionviewprops|Subscription Subscriptionview Subscriptionviewprops]]
- [[_COMMUNITY_Graphify Lifecycle Update|Graphify Lifecycle Update]]
- [[_COMMUNITY_Graphify Lifecycle Update|Graphify Lifecycle Update]]
- [[_COMMUNITY_Mobile Frame Mobileframe|Mobile Frame Mobileframe]]
- [[_COMMUNITY_Linter Settings|Linter Settings]]
- [[_COMMUNITY_Config Postcss|Config Postcss]]
- [[_COMMUNITY_Graphify Knowledge Graph|Graphify Knowledge Graph]]
- [[_COMMUNITY_Vscode Extensions Recommendations|Vscode Extensions Recommendations]]
- [[_COMMUNITY_Graphify Knowledge Graph|Graphify Knowledge Graph]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `/graphify` - 11 edges
3. `What You Must Do When Invoked` - 11 edges
4. `What You Must Do When Invoked` - 11 edges
5. `supabase` - 10 edges
6. `/graphify` - 10 edges
7. `graphify reference: extra exports and benchmark` - 7 edges
8. `graphify reference: extra exports and benchmark` - 7 edges
9. `tailwind` - 6 edges
10. `aliases` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Step 1 - Ensure graphify is installed` --references--> `Detect the correct Python interpreter (handles uv tool, pipx, venv, system installs)`  [EXTRACTED]
  .claude/skills/graphify/SKILL.md → .codex/skills/graphify/SKILL.md
- `Write interpreter path for all subsequent steps (persists across invocations)` --references--> `Save scan root so graphify update (no args) knows where to look next time`  [EXTRACTED]
  .codex/skills/graphify/SKILL.md → .claude/skills/graphify/SKILL.md
- `RoomsViewProps` --references--> `Room`  [EXTRACTED]
  src/components/rooms-view.tsx → src/lib/types.ts
- `Button()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/button.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (66 total, 22 thin omitted)

### Community 0 - "Agent System Documentation"
Cohesion: 0.11
Nodes (12): Agent Guide — PG Desk, geistMono, metadata, outfit, viewport, DashboardView(), DashboardViewProps, cn() (+4 more)

### Community 1 - "Bookings & Expenses Management"
Cohesion: 0.08
Nodes (22): BookingsView(), BookingsViewProps, EXPENSE_CATEGORIES, ExpensesView(), ExpensesViewProps, InventoryView(), InventoryViewProps, LoginView() (+14 more)

### Community 2 - "Graphify Lifecycle Update"
Cohesion: 0.08
Nodes (24): graphify, 1. uv tool install — 'uv tool dir' is authoritative, respects UVTOOLDIR automatically, 1. uv tool installs — most reliable on modern Mac/Linux, 2. pipx install — 'pipx environment' respects PIPXHOME automatically, 2. Read shebang from graphify binary (pipx and direct pip installs), 3. Active venv / conda / pip-into-current-env, 3. Fall back to python3, Detect Python with graphify — uv/pipx-aware (fixes #831) (+16 more)

### Community 3 - "Aliases Tailwind Hooks"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 4 - "3D Graphics Scene"
Cohesion: 0.05
Nodes (37): dependencies, @base-ui/react, class-variance-authority, clsx, framer-motion, gsap, lucide-react, next (+29 more)

### Community 5 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 6 - "Linter Settings"
Cohesion: 0.08
Nodes (23): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+15 more)

### Community 7 - "Graphify Lifecycle Update"
Cohesion: 0.11
Nodes (17): Also prune old nodes for re-extracted (changed) files before inserting fresh AST., and newextraction (buildmerge combines them). Falling back to, Explicit source/target last so they win over any stale attrs in d., For --cluster-only, For --update (incremental re-extraction), G.graph"hyperedges" holds hyperedges from both existing graph.json, graphify reference: incremental update and cluster-only, Load new extraction and incremental state (+9 more)

### Community 8 - "Graphify Lifecycle Update"
Cohesion: 0.11
Nodes (18): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Usage (+10 more)

### Community 9 - "Page Tenant Terms"
Cohesion: 0.16
Nodes (7): DrawerItemProps, TabButtonProps, ViewType, TenantTermsView(), TenantTermsViewProps, ViewProfileView(), ViewProfileViewProps

### Community 10 - "Rooms & Staff View"
Cohesion: 0.19
Nodes (9): RoomCardProps, RoomsView(), RoomsViewProps, Room, Tenant, BedIcon(), BedIconProps, StatCard() (+1 more)

### Community 11 - "Graphify Knowledge Graph"
Cohesion: 0.12
Nodes (17): In --update mode, 'allfiles' carries the full corpus; 'files' is the changed, LABELS - replace these with the names you chose above, Merge: AST nodes first, semantic nodes deduplicated by id, or: graphify export html --no-viz, or with custom dir: graphify export obsidian --dir ~/vaults/my-project, Part B - Semantic extraction (parallel subagents), Part C - Merge AST + semantic into final extraction, Placeholder questions - regenerated with real labels in Step 5 (+9 more)

### Community 12 - "3D Graphics Scene"
Cohesion: 0.17
Nodes (4): CameraKeyframe, cameraKeyframes, mockRooms, RoomData

### Community 13 - "Graphify Lifecycle Update"
Cohesion: 0.17
Nodes (11): BFS: explore all neighbors layer by layer up to depth 3., Depth-limited to 6 to avoid traversing the whole graph., DFS: follow one path as deep as possible before backtracking., Find best matching node, Find best-matching start nodes, For /graphify explain, For /graphify path, graphify reference: query, path, explain (+3 more)

### Community 14 - "Graphify Lifecycle Update"
Cohesion: 0.22
Nodes (8): Add --backend gemini|kimi|openai|deepseek|claude-cli depending on which API key you have set, Clone each repo, run the full pipeline on each, then merge, graphify reference: GitHub clone and cross-repo merge, Run /graphify on each local path to produce their graph.json files, Step 0 - Clone GitHub repo(s) (only if a GitHub URL was given), Then merge:, Then merge at the project root:, Use LOCALPATH as the target for all subsequent steps

### Community 15 - "Graphify Lifecycle Update"
Cohesion: 0.25
Nodes (7): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if totalwords > 5000)

### Community 16 - "Property Selector Bottom"
Cohesion: 0.33
Nodes (5): Property, PropertySelector(), PropertySelectorProps, BottomSheet(), BottomSheetProps

### Community 17 - "Graphify Lifecycle Update"
Cohesion: 0.33
Nodes (4): graphify, For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 18 - "Change Password Changepasswordview"
Cohesion: 0.40
Nodes (3): ChangePasswordView(), ChangePasswordViewProps, ChecklistItemProps

### Community 19 - "Receipts & Reminders"
Cohesion: 0.40
Nodes (4): DueItem, ReceiptItem, ReceiptsView(), ReceiptsViewProps

### Community 20 - "Readme Deploy Vercel"
Cohesion: 0.70
Nodes (4): Deploy on Vercel, Getting Started, Learn More, or

### Community 21 - "Bank Details Bankdetails"
Cohesion: 0.50
Nodes (3): BankDetails, BankDetailsView(), BankDetailsViewProps

### Community 22 - "Bills Billsview Billsviewprops"
Cohesion: 0.50
Nodes (3): BillsView(), BillsViewProps, Tenant

### Community 23 - "Notifications Notificationitem Notificationsview"
Cohesion: 0.50
Nodes (3): NotificationItem, NotificationsView(), NotificationsViewProps

### Community 24 - "Receipts & Reminders"
Cohesion: 0.50
Nodes (3): ReminderItem, RemindersView(), RemindersViewProps

### Community 25 - "Support & Terms View"
Cohesion: 0.50
Nodes (3): FAQItem, SupportView(), SupportViewProps

### Community 26 - "Wallet Transaction Walletview"
Cohesion: 0.50
Nodes (3): Transaction, WalletView(), WalletViewProps

### Community 27 - "Graphify Lifecycle Update"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 50 - "Community 50"
Cohesion: 0.14
Nodes (14): Part A - Structural extraction for code files, Part B - Semantic extraction (parallel subagents), Part C - Merge AST + semantic into final extraction, Step 0 - GitHub repos and multi-path merge (only if a URL or several paths), Step 1 - Ensure graphify is installed, Step 2.5 - Video and audio (only if video files detected), Step 2 - Detect files, Step 3 - Extract entities and relationships (+6 more)

### Community 51 - "Community 51"
Cohesion: 0.17
Nodes (11): background_color, description, display, icons, id, name, orientation, scope (+3 more)

### Community 52 - "Community 52"
Cohesion: 0.25
Nodes (7): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 53 - "Community 53"
Cohesion: 0.25
Nodes (7): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 54 - "Community 54"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 55 - "Community 55"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 56 - "Community 56"
Cohesion: 0.50
Nodes (3): For /graphify explain, For /graphify path, graphify reference: query, path, explain

### Community 57 - "Community 57"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 58 - "Community 58"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 59 - "Community 59"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 60 - "Community 60"
Cohesion: 0.50
Nodes (3): For /graphify explain, For /graphify path, graphify reference: query, path, explain

### Community 61 - "Community 61"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **225 isolated node(s):** `PreToolUse`, `PreToolUse`, `recommendations`, `$schema`, `style` (+220 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `PreToolUse`, `PreToolUse`, `recommendations` to the rest of the system?**
  _225 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Agent System Documentation` be split into smaller, more focused modules?**
  _Cohesion score 0.10952380952380952 - nodes in this community are weakly interconnected._
- **Should `Bookings & Expenses Management` be split into smaller, more focused modules?**
  _Cohesion score 0.08172043010752689 - nodes in this community are weakly interconnected._
- **Should `Graphify Lifecycle Update` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Aliases Tailwind Hooks` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `3D Graphics Scene` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `TypeScript Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._