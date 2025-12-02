# RERUM Playground — Next Team Notes



## 1. Current State Summary
The current team has completed:
- Core architectural refactoring to support stronger modularity
- Documentation upgrades (partial)
- Component separation, Services extraction, and Feature layers
- IIIF Manifest Generator implementation
- Backlog refresh (cleaned, organized, and labeled)

## 2. Key Technical Decisions
- All UI logic should live under `/web/js/components/`
- Fetch/API logic should be centralized in `/web/js/services/`
- Feature-level orchestration (no DOM, no API logic) stays under `/web/js/features/`
- Utility helpers remain under `/web/js/utils/`
- Documentation expected to move into Docusaurus
- LocalStorage used for manifest persistence

## 3. Known Technical Debt & Challenges
- Some files still mix UI + logic (see labels: `refactor-needed`)
- Docusaurus integration unresolved (blocking error with component bundling paths)
- Testing not yet enabled due to Single Responsibility principle not fully met

## 4. Recommended First Tasks
Start small and build familiarity:
1. Isolate last remaining DOM handlers into components
2. Help resolve Docusaurus bundling issue
3. Create testable boundary points in upcoming refactors
4. Consider splitting manifest UI into a separate module

## 5. Good First Issues for External Contributors

Suggested external starter tasks:
- UI logic cleanup
- Refactoring shared utility functions
- Thumbnail rendering templating
- Improve README sections
- Add missing JSDoc documentation

## 6. Priority Roadmap (Post-Semester)
- Complete Docs site migration to Docusaurus
- Add unit tests once refactor is stable
- Finalize IIIF Manifest storage strategy

## 7. Project Board + Issues Links
- **Project Board:** https://github.com/orgs/oss-slu/projects/34
- **GitHub Issues:**  https://github.com/oss-slu/rerum-playground/issues

## 8. Guiding Principles (Keep These)
- Clear separation of concerns
- Lean, testable functions
- Folder structure integrity
- PRs must include descriptive context & acceptance criteria
- Focus on external contributor friendliness

## 9. Contacts
If you need context or archived design decisions:
- Client: Bryan, Patrick
- Mentor: Daniel
- Help : Devayani Konakalla

Future teams should maintain this file and update it every major sprint.
