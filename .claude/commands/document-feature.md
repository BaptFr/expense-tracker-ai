# Document Feature Command

Generate comprehensive technical and user-friendly documentation for new features.

## Documentation Standards

Examples of existing documentation to match:
- Developer docs: `docs/dev/` folder - Technical architecture, API specs, implementation notes
- User docs: `docs/user/` folder - Step-by-step guides, UI screenshots, troubleshooting
- Cross-references linking between technical and user documentation

Stack reference:
- **Backend**: NestJS controllers, services, DTOs in `src/backend/`
- **Frontend**: Next.js pages, components in `src/app/`
- **Database**: Prisma schema in `prisma/schema.prisma`
- **Storage**: MinIO S3-compatible operations for file uploads

## Process

1. **First**: Understand the feature by analyzing relevant code files:
   - Prisma schema changes (database layer)
   - NestJS controllers/services (business logic)
   - Next.js components/pages (UI layer)
   - Any file storage or external integrations

2. **Second**: Determine architecture type:
   - Backend-only: Database + API endpoints, minimal UI
   - Frontend-only: UI components with existing APIs
   - Full-stack: New endpoints + new UI components + database changes

3. **Third**: Generate two documentation files with proper cross-references

## Output Requirements

### Developer Documentation: `docs/dev/{feature-name}-implementation.md`

- **Overview**: Brief description of what the feature does
- **Technical Architecture**: System design, components involved
- **Database Schema**: Prisma migrations and model changes
- **API Endpoints**:
  - HTTP method, route, request/response examples
  - Authentication requirements
  - Error handling
- **Frontend Implementation**: Component structure, state management
- **Implementation Notes**: Key decisions, edge cases, performance considerations
- **File Storage** (if applicable): MinIO bucket names, file operations
- **Related Documentation**: Links to related features

### User Documentation: `docs/user/how-to-{feature-name-slug}.md`

- **Quick Start**: 3-5 sentence overview
- **Prerequisites**: What users need before starting
- **Step-by-Step Instructions**:
  - Number each step (1, 2, 3...)
  - Include `[Screenshot: Description of what to see]` placeholders
  - Provide context for each action
- **Tips & Tricks**: Advanced usage, shortcuts, best practices
- **Troubleshooting**: Common issues and solutions
- **Related Guides**: Links to similar or dependent features
- **Support**: Contact or help links if applicable

## Cross-References

- Developer docs should link to user docs: "See [User Guide](../user/how-to-{feature}.md)"
- User docs should link to developer docs in footer: "Technical details: [Developer Documentation](../dev/{feature}-implementation.md)"
- Link to related features in both directions

## Feature Detection Checklist

- ✓ Read Prisma schema for database changes
- ✓ Check NestJS controllers for new endpoints
- ✓ Find Next.js pages/components for UI changes
- ✓ Verify authentication/authorization patterns used
- ✓ Detect any MinIO storage operations
- ✓ Identify validation logic (DTOs, form validation)
- ✓ Note error handling patterns
- ✓ Find related existing documentation

## Screenshot Placeholders

Format: `[Screenshot: Clear description of UI state]`

Examples:
- `[Screenshot: Company creation form with filled fields]`
- `[Screenshot: Success confirmation message]`
- `[Screenshot: Error validation on required fields]`

Placement:
- After each significant step
- At state transitions (before/after actions)
- For any complex UI elements

## Formatting Rules

- Use markdown headers: `#`, `##`, `###` for hierarchy
- Code blocks with language: ` ```typescript ` for code samples
- Bold for UI elements: `**Click** the Save button`
- Italics for emphasis: *important*
- Use numbered lists for steps, bullets for lists
- Keep paragraphs concise (2-3 sentences max)

## Quality Checklist

- [ ] Developer docs include all necessary technical details
- [ ] User docs are understandable to non-technical users
- [ ] Code examples are accurate and runnable
- [ ] Screenshot placeholders clearly describe the UI
- [ ] Cross-references exist between dev and user docs
- [ ] Related features are linked appropriately
- [ ] No unexplained technical jargon in user docs
- [ ] Both files saved in correct directories
- [ ] Files follow naming conventions: `{feature-name}` or `how-to-{feature-name-slug}`
- [ ] Markdown syntax is valid