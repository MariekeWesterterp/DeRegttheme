## DeRegt Theme – Agent Guide

This document gives you the essentials to work on this HubSpot theme: structure, conventions, and operational commands (Git and HubSpot CLI).

### Tech stack
- HubSpot CMS Theme (modules, templates, macros)
- HTML, CSS, HubL
- Optional JS per module

### Repository layout
- `DeRegt/` – the HubSpot theme root (uploaded to the Design Manager as `DeRegt`)
  - `modules/` – custom HubSpot modules (each in its own folder)
  - `macro/` – reusable HubL macros (e.g., `margin-padding.html`, `button-group.html`)
  - `css/`, `js/`, `images/` – shared assets
  - `templates/`, `sections/` – theme templates/sections

### Module structure and naming
Each module folder contains:
- `module.html` – HubL/HTML markup
- `module.css` – module-scoped CSS
- `fields.json` – array of field objects (project convention)
- `meta.json` – basic metadata

Conventions:
- Class names use block-element format: `modulename__element`, e.g., `hero__navbar`, `hero__buttons`.
- Keep the shared wrapper class `container` for width/layout consistency.
- Kep the shared top-bottom padding class `default-padding` for padding-consistency
- Use the margin/padding macro wrapper on the top-level content element:
  - `{{ macros.margin_padding(module.style.margin_block, module.style.padding_block) }}`
- Buttons use shared classes:
  - Primary: `btn-primary`
  - Secondary/outline: `btn-secondary`
  - Secondary/outline white: `btn-secondary-white` in addition to `btn-secondary`
- If there are buttons in a module, you should give the user the choice:
  - Either they choose a button, where you offer a text field and URL field and the appearance of the button (primary, secondary or secondary-white)
  - Or they choose the CTA option that Hubspot offers. See: https://developers.hubspot.com/docs/cms/reference/fields/module-theme-fields#cta

### Margin/padding and buttons
- Use `macro/margin-padding.html` for spacing (`margin-top-…`, `padding-…`).
- Use `macro/button-group.html` when you need a standard dual-CTA + text-link layout.

### fields.json schema (project style)
- Use an array of field objects (not a single object with an inner `fields` array).
- Include `id`, `name`, `label`, `type`, plus control props consistent with existing modules.
- Group fields with `type: "group"`; repeatable groups: `repeating: true`.
- Use `type: "url"` for links. Avoid unsupported types (e.g., WhatsApp) to prevent upload errors.
- Mirror choices format used elsewhere, e.g.:
  - `"display": "select"`
  - `"choices": [["value","Label"], …]`
- When adding fields, use this format for the id's of the field: `a8784e45-bf00-4b97-9034-0c18b3b83a3a`


### CSS
- Keep styles module-scoped (prefix with the module block class).
- Reuse existing utility classes (e.g., `container`) and theme variables.
- The buttons all share the same styling from the main CSS files. The yellow buttons are assigned the btn-primary class. The transparent buttons with a blue border are assigned the btn-secondary class. he white framed button should also have the class `btn-secondary-white` in addition to `btn-secondary` 

### Adding a new module (quick steps)
1. Create folder: `DeRegt/modules/<name>.module/`
2. Add `module.html`, `module.css`, `fields.json` (array style), `meta.json`.
3. In `module.html`, import macros as needed:
   - `{% import "/DeRegt/macro/margin-padding.html" as macros %}`
4. Wrap content with the margin/padding macro and `container`.
5. Use classes `btn-primary` / `btn-secondary` for buttons. The white framed button should also have the class `btn-secondary-white` in addition to `btn-secondary` 

### HubSpot CLI (upload/deploy)
- Upload a single module (preferred during dev):
  - `hs upload ./DeRegt/modules/<name>.module DeRegt/modules/<name>.module --account=<account>`
- Upload the whole theme:
  - `hs upload ./DeRegt DeRegt --account=<account>`
- Set/confirm account:
  - `hs accounts list`
  - `hs accounts use <account>`
  - `hs auth login` (if needed)

Active account (example used in this project): `frontendstars` (portalId `26859049`).

### Git workflow
- Create focused commits; include module name and change:
  - `feat(hero module): add hero HubSpot module`
- Push to `main` (or feature branch per team policy) and then upload via CLI.

### Troubleshooting uploads
- JSON errors on `fields.json` usually mean schema mismatch:
  - Ensure array-of-fields format matches existing modules.
  - Avoid reserved field names (e.g., avoid a child named `label`).
  - Remove unsupported URL types (keep it to core `url`).
  - For repeating groups: `type: "group"` + `repeating: true`.
- If assets upload except `fields.json`, fix schema and re-run the `hs upload` for the module.

### Useful references in this repo
- Example fields schema: `DeRegt/modules/Default.module/fields.json`
- Spacing macro: `DeRegt/macro/margin-padding.html`
- Button macro: `DeRegt/macro/button-group.html`

### Contact points
- Theme root on HubSpot: `DeRegt`
- Standard page types: landing pages, site pages, blogs


