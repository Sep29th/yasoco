This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```
yasoco
├─ .idea
│  ├─ inspectionProfiles
│  │  └─ Project_Default.xml
│  ├─ modules.xml
│  ├─ vcs.xml
│  ├─ workspace.xml
│  └─ yasoco.iml
├─ app
│  ├─ (main)
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ admin
│  │  ├─ (manager)
│  │  │  ├─ @modal
│  │  │  │  ├─ (.)roles
│  │  │  │  │  └─ [id]
│  │  │  │  │     ├─ loading.tsx
│  │  │  │  │     └─ page.tsx
│  │  │  │  └─ default.js
│  │  │  ├─ forbidden
│  │  │  │  └─ page.tsx
│  │  │  ├─ layout.tsx
│  │  │  ├─ not-found.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ roles
│  │  │  │  ├─ create
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  ├─ [id]
│  │  │  │  │  └─ edit
│  │  │  │  │     └─ page.tsx
│  │  │  │  ├─ _actions
│  │  │  │  │  ├─ create.ts
│  │  │  │  │  └─ delete.ts
│  │  │  │  ├─ _components
│  │  │  │  │  ├─ create-role-client.tsx
│  │  │  │  │  └─ permission-client.tsx
│  │  │  │  ├─ _types
│  │  │  │  │  ├─ access-level-map.ts
│  │  │  │  │  ├─ action-item.ts
│  │  │  │  │  ├─ level.ts
│  │  │  │  │  └─ resource.ts
│  │  │  │  └─ _utils
│  │  │  │     └─ infer-level-action.ts
│  │  │  ├─ [...slug]
│  │  │  │  └─ page.tsx
│  │  │  ├─ _components
│  │  │  │  ├─ appointment.tsx
│  │  │  │  ├─ article.tsx
│  │  │  │  ├─ header.tsx
│  │  │  │  ├─ layout-client.tsx
│  │  │  │  ├─ logo.tsx
│  │  │  │  ├─ profile-dropdown.tsx
│  │  │  │  ├─ sidebar-menu-item.tsx
│  │  │  │  ├─ sidebar.tsx
│  │  │  │  ├─ skeleton.tsx
│  │  │  │  ├─ tag.tsx
│  │  │  │  └─ user.tsx
│  │  │  └─ _types
│  │  │     └─ menu-item.tsx
│  │  └─ sign-in
│  │     ├─ page.tsx
│  │     ├─ _actions
│  │     │  └─ sign-in.ts
│  │     ├─ _components
│  │     │  ├─ sign-in-form.tsx
│  │     │  └─ submit-button.tsx
│  │     ├─ _schemas
│  │     │  └─ sign-in.ts
│  │     └─ _types
│  │        └─ sign-in-state.ts
│  ├─ apple-icon.png
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ icon.png
│  ├─ layout.tsx
│  └─ not-found.tsx
├─ components
│  ├─ floating-buttons.tsx
│  ├─ mobile-nav.tsx
│  ├─ modal-wrapper.tsx
│  ├─ nav-link-client.tsx
│  ├─ nav-link.tsx
│  └─ ui
│     ├─ badge.tsx
│     ├─ button.tsx
│     ├─ checkbox.tsx
│     ├─ dialog.tsx
│     ├─ dropdown-menu.tsx
│     ├─ input.tsx
│     ├─ label.tsx
│     ├─ pagination.tsx
│     ├─ popover.tsx
│     ├─ separator.tsx
│     ├─ skeleton.tsx
│     ├─ table.tsx
│     └─ tooltip.tsx
├─ components.json
├─ eslint.config.mjs
├─ lib
│  ├─ article.ts
│  ├─ auth
│  ├─ auth.ts
│  ├─ constants
│  │  └─ permission.ts
│  ├─ examination.ts
│  ├─ generated
│  ├─ jwt.ts
│  ├─ prisma.ts
│  ├─ role.ts
│  ├─ tag.ts
│  ├─ user.ts
│  └─ utils.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20251108122632_init
│  │  │  └─ migration.sql
│  │  ├─ 20251109140147_create_indx_and_add_cms
│  │  │  └─ migration.sql
│  │  ├─ 20251112123457_modify_session
│  │  │  └─ migration.sql
│  │  ├─ 20251112135938_session_add_expire
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts
├─ proxy.ts
├─ public
│  ├─ 403.svg
│  ├─ 404.svg
│  ├─ file.svg
│  ├─ footer.webp
│  ├─ full-logo.png
│  ├─ globe.svg
│  ├─ Icon_of_Zalo.svg
│  ├─ leaf-purple.svg
│  ├─ logo.png
│  ├─ medicine-bro.svg
│  ├─ next.svg
│  ├─ pill-purple.svg
│  ├─ section1.webp
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ tsconfig.json
└─ utils
   └─ extractPlainText.ts

```
```
yasoco
├─ .idea
│  ├─ inspectionProfiles
│  │  └─ Project_Default.xml
│  ├─ modules.xml
│  ├─ vcs.xml
│  ├─ workspace.xml
│  └─ yasoco.iml
├─ app
│  ├─ (main)
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ admin
│  │  ├─ (manager)
│  │  │  ├─ @modal
│  │  │  │  ├─ (...)
│  │  │  │  │  └─ admin
│  │  │  │  │     └─ roles
│  │  │  │  │        └─ view
│  │  │  │  │           └─ [id]
│  │  │  │  │              ├─ loading.tsx
│  │  │  │  │              ├─ page.tsx
│  │  │  │  │              └─ _utils
│  │  │  │  │                 └─ determine-level.ts
│  │  │  │  └─ default.js
│  │  │  ├─ forbidden
│  │  │  │  └─ page.tsx
│  │  │  ├─ layout.tsx
│  │  │  ├─ not-found.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ roles
│  │  │  │  ├─ create
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  ├─ [id]
│  │  │  │  │  └─ edit
│  │  │  │  │     └─ page.tsx
│  │  │  │  ├─ _actions
│  │  │  │  │  ├─ create.ts
│  │  │  │  │  └─ delete.ts
│  │  │  │  ├─ _components
│  │  │  │  │  ├─ create-role-client.tsx
│  │  │  │  │  └─ permission-client.tsx
│  │  │  │  ├─ _types
│  │  │  │  │  ├─ access-level-map.ts
│  │  │  │  │  ├─ action-item.ts
│  │  │  │  │  ├─ level.ts
│  │  │  │  │  └─ resource.ts
│  │  │  │  └─ _utils
│  │  │  │     └─ infer-level-action.ts
│  │  │  ├─ [...slug]
│  │  │  │  └─ page.tsx
│  │  │  ├─ _components
│  │  │  │  ├─ appointment.tsx
│  │  │  │  ├─ article.tsx
│  │  │  │  ├─ header.tsx
│  │  │  │  ├─ layout-client.tsx
│  │  │  │  ├─ logo.tsx
│  │  │  │  ├─ profile-dropdown.tsx
│  │  │  │  ├─ sidebar-menu-item.tsx
│  │  │  │  ├─ sidebar.tsx
│  │  │  │  ├─ skeleton.tsx
│  │  │  │  ├─ tag.tsx
│  │  │  │  └─ user.tsx
│  │  │  └─ _types
│  │  │     └─ menu-item.tsx
│  │  └─ sign-in
│  │     ├─ page.tsx
│  │     ├─ _actions
│  │     │  └─ sign-in.ts
│  │     ├─ _components
│  │     │  ├─ sign-in-form.tsx
│  │     │  └─ submit-button.tsx
│  │     ├─ _schemas
│  │     │  └─ sign-in.ts
│  │     └─ _types
│  │        └─ sign-in-state.ts
│  ├─ apple-icon.png
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ icon.png
│  ├─ layout.tsx
│  └─ not-found.tsx
├─ components
│  ├─ floating-buttons.tsx
│  ├─ mobile-nav.tsx
│  ├─ modal-wrapper.tsx
│  ├─ nav-link-client.tsx
│  ├─ nav-link.tsx
│  └─ ui
│     ├─ badge.tsx
│     ├─ button.tsx
│     ├─ checkbox.tsx
│     ├─ dialog.tsx
│     ├─ dropdown-menu.tsx
│     ├─ input.tsx
│     ├─ label.tsx
│     ├─ pagination.tsx
│     ├─ popover.tsx
│     ├─ separator.tsx
│     ├─ skeleton.tsx
│     ├─ table.tsx
│     └─ tooltip.tsx
├─ components.json
├─ eslint.config.mjs
├─ lib
│  ├─ article.ts
│  ├─ auth
│  ├─ auth.ts
│  ├─ constants
│  │  └─ permission.ts
│  ├─ examination.ts
│  ├─ generated
│  ├─ jwt.ts
│  ├─ prisma.ts
│  ├─ role.ts
│  ├─ tag.ts
│  ├─ user.ts
│  └─ utils.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20251108122632_init
│  │  │  └─ migration.sql
│  │  ├─ 20251109140147_create_indx_and_add_cms
│  │  │  └─ migration.sql
│  │  ├─ 20251112123457_modify_session
│  │  │  └─ migration.sql
│  │  ├─ 20251112135938_session_add_expire
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts
├─ proxy.ts
├─ public
│  ├─ 403.svg
│  ├─ 404.svg
│  ├─ file.svg
│  ├─ footer.webp
│  ├─ full-logo.png
│  ├─ globe.svg
│  ├─ Icon_of_Zalo.svg
│  ├─ leaf-purple.svg
│  ├─ logo.png
│  ├─ medicine-bro.svg
│  ├─ next.svg
│  ├─ pill-purple.svg
│  ├─ section1.webp
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ tsconfig.json
└─ utils
   └─ extractPlainText.ts

```