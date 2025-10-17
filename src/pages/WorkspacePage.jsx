import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { getWorkspacePageContent } from "../data/workspacePages";
import { resolveTemplate } from "../data/pageTemplates";

function QuickLinkButton({ link }) {
  const className = "inline-flex items-center gap-2 rounded-md border border-brand-orange/30 bg-brand-orange/10 px-3 py-2 text-sm font-semibold text-brand-brown transition-colors hover:bg-brand-orange/15";
  if (link.to) {
    return (
      <NavLink to={link.to} className={className}>
        {link.label}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </NavLink>
    );
  }
  if (link.href) {
    return (
      <a href={link.href} className={className} target="_blank" rel="noreferrer">
        {link.label}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </a>
    );
  }
  return null;
}

function SectionList({ section }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-brand-brown">{section.title}</h2>
        {section.description ? (
          <p className="mt-1 text-sm text-brand-brown/70">{section.description}</p>
        ) : null}
      </div>
      <ul className="space-y-3">
        {(section.items || []).map((item) => (
          <li
            key={item.label}
            className="flex items-start gap-3 rounded-xl border border-cream-border bg-white/80 p-4 shadow-sm"
          >
            <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-cream-hover text-brand-orange">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-brand-brown">{item.label}</p>
              {item.description ? (
                <p className="text-sm text-brand-brown/70">{item.description}</p>
              ) : null}
              {item.helper ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange/80">
                  {item.helper}
                </p>
              ) : null}
            </div>
            {item.to ? (
              <NavLink
                to={item.to}
                className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-cream-border text-brand-brown/70 transition-colors hover:bg-cream-hover hover:text-brand-brown"
                aria-label={`Open ${item.label}`}
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </NavLink>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function normalizeTemplate(templateInput, route, pageMeta) {
  try {
    if (templateInput) {
      return resolveTemplate(templateInput);
    }
    return resolveTemplate("pageTemplate", { meta: pageMeta });
  } catch (error) {
    console.error("[workspace] Failed to resolve template", error);
    return resolveTemplate("pageTemplate", { meta: pageMeta });
  }
}

export default function WorkspacePage({ pageKey, template, route }) {
  const page = getWorkspacePageContent(pageKey);
  const mergedTemplate = useMemo(
    () => normalizeTemplate(template, route, page.meta ?? {}),
    [template, route, page.meta]
  );

  const stats = Array.isArray(page.stats) ? page.stats.filter((stat) => stat && stat.label && stat.value) : [];
  const quickLinks = Array.isArray(page.quickLinks) ? page.quickLinks.filter((link) => link && (link.to || link.href)) : [];
  const sections = Array.isArray(page.sections) ? page.sections.filter((section) => section && section.title) : [];
  const footerConfig = mergedTemplate.layout?.footer ?? { show: false };
  const sidebarTools = mergedTemplate.layout?.sidebarTools;

  return (
    <div className="space-y-10 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <span className="inline-flex items-center rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-orange/90">
          {page.roleLabel ? `${page.roleLabel} workspace` : "Workspace"}
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold leading-snug text-brand-brown sm:text-3xl">{page.title}</h1>
          {page.subtitle ? (
            <p className="max-w-3xl text-base text-brand-brown/75">{page.subtitle}</p>
          ) : null}
        </div>
        {Array.isArray(mergedTemplate.layout?.header?.breadcrumbs) && mergedTemplate.layout.header.showBreadcrumbs !== false ? (
          <nav aria-label="Breadcrumb" className="flex flex-wrap gap-1 text-xs text-brand-brown/60">
            {mergedTemplate.layout.header.breadcrumbs.map((crumb, index) => (
              <React.Fragment key={`${crumb.path || crumb.label}-${index}`}>
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {crumb.path ? (
                  <NavLink to={crumb.path} className="hover:text-brand-brown">
                    {crumb.label}
                  </NavLink>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : null}
        {Array.isArray(mergedTemplate.layout?.header?.actionButtons) && mergedTemplate.layout.header.showActionBar !== false ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {mergedTemplate.layout.header.actionButtons.map((button) => (
              <button
                key={button.label}
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-brand-orange/40 bg-brand-orange/10 px-3 py-2 text-sm font-semibold text-brand-brown transition-colors hover:bg-brand-orange/15"
              >
                {button.icon ? <span aria-hidden="true">{button.icon}</span> : null}
                {button.label}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      {stats.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-brown/60">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold text-brand-brown">{stat.value}</p>
              {stat.helper ? (
                <p className="mt-2 text-sm text-brand-brown/70">{stat.helper}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {quickLinks.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {quickLinks.map((link) => (
            <QuickLinkButton key={`${link.to || link.href}-${link.label}`} link={link} />
          ))}
        </div>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-10">
          {sections.length > 0 ? (
            sections.map((section) => (
              <SectionList key={section.title} section={section} />
            ))
          ) : (
            <div className="rounded-xl border border-cream-border bg-white/80 p-6 text-brand-brown/70">
              We&apos;re preparing structured content for this workspace. Check back soon.
            </div>
          )}
        </div>

        {sidebarTools?.tools?.length ? (
          <aside className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-brand-brown/80">Workspace Tools</h2>
              {sidebarTools.collapsible ? (
                <span className="text-xs uppercase tracking-wide text-brand-brown/50">Collapsible</span>
              ) : null}
            </div>
            <div className="space-y-3">
              {sidebarTools.tools.map((tool) => (
                <button
                  key={tool.label}
                  type="button"
                  className="w-full rounded-lg border border-cream-border bg-white/90 px-3 py-3 text-left text-sm font-semibold text-brand-brown transition-colors hover:bg-cream-hover"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                      {tool.icon}
                    </span>
                    <div>
                      <p>{tool.label}</p>
                      {tool.target ? (
                        <p className="text-xs font-medium uppercase tracking-wide text-brand-brown/50">{tool.actionType}</p>
                      ) : null}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        ) : null}
      </div>

      {footerConfig.show ? (
        <footer className="border-t border-cream-border pt-6 text-sm text-brand-brown/70">
          {footerConfig.content ? <p>{footerConfig.content}</p> : null}
          {Array.isArray(footerConfig.links) && footerConfig.links.length ? (
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              {footerConfig.links.map((link) => (
                <NavLink key={link.path || link.label} to={link.path || "#"} className="hover:text-brand-brown">
                  {link.label}
                </NavLink>
              ))}
            </div>
          ) : null}
        </footer>
      ) : null}
    </div>
  );
}
