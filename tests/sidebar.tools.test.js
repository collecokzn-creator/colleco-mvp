import { describe, it, expect } from 'vitest';
import { TOOL_CONFIG } from '../src/components/Sidebar.jsx';

describe('Sidebar TOOL_CONFIG', () => {
  it('admin tools contain required entries and routes', () => {
    const labels = TOOL_CONFIG.admin.map(t => t.label);
    const routes = Object.fromEntries(TOOL_CONFIG.admin.map(t => [t.label, t.to]));
    expect(labels).toContain('⚙️ Admin Console');
    expect(labels).toContain('📊 Analytics');
    expect(labels).toContain('🤝 Partner Management');
    expect(labels).toContain('📦 Packages');
    expect(labels).toContain('📈 Reports');
    expect(labels).toContain('🛡️ Compliance');
    expect(routes['📦 Packages']).toBe('/admin/packages');
  });

  it('partner tools include bookings, earnings, support, packages to /packages', () => {
    const labels = TOOL_CONFIG.partner.map(t => t.label);
    const routes = Object.fromEntries(TOOL_CONFIG.partner.map(t => [t.label, t.to]));
    expect(labels).toContain('📔 My Bookings');
    expect(labels).toContain('💰 Earnings');
    expect(labels).toContain('💬 Support');
    expect(labels).toContain('📦 Packages');
    expect(routes['📦 Packages']).toBe('/packages');
  });

  it('client tools include trips, plan trip, support, packages to /packages', () => {
    const labels = TOOL_CONFIG.client.map(t => t.label);
    const routes = Object.fromEntries(TOOL_CONFIG.client.map(t => [t.label, t.to]));
    expect(labels).toContain('🧳 My Trips');
    expect(labels).toContain('🧭 Plan Trip');
    expect(labels).toContain('💬 Support');
    expect(labels).toContain('📦 Packages');
    expect(routes['📦 Packages']).toBe('/packages');
  });
});
