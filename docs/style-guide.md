# CollEco UI Style Guide (Hero Pattern & Page Layout)

## Core Layout
- Root page wrapper: `bg-cream min-h-screen overflow-x-hidden`
- Content container: `max-w-6xl mx-auto px-4 sm:px-6 py-8` (Use `max-w-7xl` only for very data-dense partner tools)
- Vertical rhythm: Top spacing `py-8`; subsequent section blocks separated by `mt-8` (or `mt-10` for major transitions)

## Hero Header Block
Placed at top inside container.
```
<div class="mb-8">
  <h1 class="text-3xl sm:text-4xl font-bold text-brand-brown tracking-tight">Page Title</h1>
  <p class="mt-2 text-sm sm:text-base text-brand-russty max-w-prose">Concise subtitle reinforcing purpose.</p>
  <div class="mt-4 flex flex-wrap gap-3">/* optional action buttons */</div>
</div>
```
- Never use opacity fades on heading/subtitle.
- Use emojis sparingly: prefix the title only when reinforcing context (e.g. ✈️ Trip Itinerary). If used, keep after an accessible hidden label when necessary.

## Buttons
Use unified `Button` component.
- Primary CTA: variant `primary` (brand-orange). Only one dominant primary per hero.
- Secondary: variant `secondary` (white surface outline/brand-brown text) or `outline` for contrasting yet minimal.
- Minor page actions (filters, toggles): `subtle` or `ghost`.
- Destructive: `danger`.
- Sizes: hero CTAs typically `md` or `lg`; inline small actions `xs` / `sm`.
- Avoid gradients and opacity transitions; rely on solid colors + subtle elevation (`shadow-sm hover:shadow-md`).

## Color Usage
- Headings: `text-brand-brown` (never orange unless small accent heading inside a card/CTA area).
- Accent labels / small uppercase: may use `text-brand-orange/80` (reserved for micro-tagline lines in hero only).
- Subtitles: `text-brand-russty` or `text-brand-brown/70` for secondary description.
- Background panels: use `bg-white` (card surface) with `border border-cream-border` and `rounded-lg` / `rounded-xl`.
- Decorative soft zones: `bg-cream-sand` or `bg-cream` limited to callouts / info sections.

## Spacing & Containers
- Cards: `p-5` (or `p-6` for high-density forms), `rounded-lg` or `rounded-xl`.
- Form grids: use `grid grid-cols-1 md:grid-cols-2 gap-4`.
- Section headings inside a page: `text-xl font-semibold` with `mb-4` before content.

## Typography Scale
- Page title (hero): `text-3xl sm:text-4xl font-bold`.
- Section heading: `text-lg font-semibold` or `text-xl font-bold` depending on prominence.
- Body text: `text-sm` (default), elevate to `text-base` for dense explanatory paragraphs.
- Microcopy / labels: `text-xs font-medium`.

## Action Groups
- Wrap hero actions in `flex flex-wrap gap-3`. Avoid more than 4 hero actions; move extras to subsequent sections.
- Position sticky or inline form actions at section bottom using consistent flex alignment.

## Icons & Emojis
- Prefer emoji prefix for itinerary, promotions, or templates where semantic value is high.
- For accessibility, ensure context is clear in text; avoid standalone emoji as only label.

## Accessibility & Interactions
- All interactive elements must have visible focus: Button component already applies `focus-visible:ring-2` styling.
- Avoid relying on opacity changes for hover. Use background or border color shifts + shadow.

## Page Structure Template
```
<div class="bg-cream min-h-screen overflow-x-hidden">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
    {/* Hero */}
    <div class="mb-8">
      <h1 class="text-3xl sm:text-4xl font-bold text-brand-brown">Title</h1>
      <p class="mt-2 text-sm sm:text-base text-brand-russty max-w-prose">Subtitle clarifying purpose.</p>
      <div class="mt-4 flex flex-wrap gap-3">{/* Buttons */}</div>
    </div>

    {/* Sections */}
    <section class="mb-8">
      <h2 class="text-xl font-semibold text-brand-brown mb-4">Section Heading</h2>
      <div class="bg-white border border-cream-border rounded-lg p-5 shadow-sm">Content...</div>
    </section>

    {/* Additional sections with consistent spacing */}
  </div>
</div>
```

## Do / Don't
- Do: Use consistent container width; remove ad-hoc padding variants.
- Do: Keep headings left-aligned (center only for marketing/testimonial blocks).
- Do: Use `max-w-prose` on lengthy subtitle paragraphs.
- Don't: Mix multiple large color headings in one hero block.
- Don't: Use raw Tailwind opacity classes on button backgrounds.
- Don't: Introduce new color hex codes—use Tailwind configured brand palette.

## Migration Checklist
1. Ensure page root wrapper matches layout spec.
2. Normalize hero header block (title + subtitle + actions).
3. Replace legacy button markup with `<Button />` variants.
4. Audit borders: convert stray `border-gray-*` to `border-cream-border`.
5. Replace opacity-based hover deletes with danger Button or icon button.
6. Confirm spacing: hero `mb-8`; each section `mb-8` except last.
7. Run build and tests after batch changes.

---
Revision 1.0 · Generated automatically to codify current hero conventions (sourced from `Home.jsx`).
