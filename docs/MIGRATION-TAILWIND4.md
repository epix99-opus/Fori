# Tailwind 4 Migration Plan

## Scope

`prototype/` may stay on Tailwind CSS 3.x during prototype revision work. Production implementation must move to Tailwind CSS 4.x before feature development leaves prototype stage.

## Steps

1. Create a dedicated branch for the upgrade and keep UI behavior changes out of the same commit.
2. Upgrade dependencies in `prototype/package.json`: `tailwindcss@^4`, compatible `postcss`, and any shadcn/ui peer requirements.
3. Replace the Tailwind 3 PostCSS plugin wiring with the Tailwind 4 plugin configuration required by the installed version.
4. Migrate `tailwind.config.ts` theme tokens into Tailwind 4-compatible CSS/theme configuration while preserving Fori colors, typography, radius, and shadows.
5. Verify shadcn/ui generated classes still resolve; regenerate affected components only if class names or CSS variables fail.
6. Run `cd prototype && npm run build`.
7. Run a visual pass on mobile 390x844, tablet 820x1180, and desktop 1440x900 for the 21 core pages plus required routes.
8. Remove this prototype exception from `docs/SPEC.md` and `docs/ARCHITECTURE.md` once production uses Tailwind 4.x.

## Acceptance

- `npm run build` passes.
- No missing Tailwind utility warnings appear in build output.
- TabBar, cards, forms, charts, and PWA shell preserve current spacing and typography.
- The migration commit contains dependency/config/CSS changes only unless a component change is required by Tailwind 4 behavior.
