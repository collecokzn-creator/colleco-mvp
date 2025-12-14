# CollEco Sidebar Operations Guide

## Overview

The CollEco sidebar is the **operational engine** of the platform - a smart, real-time command center that maximizes efficiency, client service, and partner satisfaction through intelligent design and role-specific features.

## Architecture

### Core Components

1. **Role-Based Navigation** - Dynamic sections based on user role (Admin, Partner, Client)
2. **Real-Time Metrics** - Live stats dashboard showing key performance indicators
3. **Smart Badges** - Visual alerts for pending actions, new items, and urgent notifications
4. **Quick Actions** - One-click access to most frequently used operations
5. **Notification Center** - Centralized alert system with unread counts
6. **Multi-Language Support** - Global language switching
7. **Auto-Sync System** - Real-time data synchronization

## Features by Role

### Admin (CollEco Operations)

#### Command Center
- **Dashboard** - Real-time platform overview with LIVE badge
- **Analytics** - Platform performance metrics
- **Reports** - Operational reports and insights

#### Quick Stats Widget
- **Active Items** - Currently active operations (24)
- **Pending Reviews** - Items awaiting approval (12)
- **Total Partners** - Active partner count (156)
- **System Uptime** - Platform reliability (89%)

#### Quick Actions
- **Review Partners** - Quick access with pending count badge
- **Check Bookings** - Direct link to booking management

#### Sections
1. **User Management** - Partners, clients, verification (with pending badge)
2. **Operations** - Bookings, listings, compliance
3. **Finance & Growth** - Revenue tracking, promotions, content

### Partner (Supplier Operations)

#### Dashboard & Performance
- **Dashboard** - Business overview with LIVE badge
- **Performance** - Analytics and insights
- **Views** - Product visibility metrics

#### Quick Stats Widget
- **New Bookings** - Pending confirmations (8)
- **Confirmed** - Active bookings (34)
- **Earnings** - Current period revenue ($4.2k)
- **Views** - Product impressions (1.2k)

#### Quick Actions
- **View Bookings** - Direct access with new count (8)
- **Update Availability** - Calendar management
- **View Earnings** - Financial dashboard

#### Sections
1. **Inventory & Products** - Hotels, tours, cars, activities, featured listings
2. **Bookings & Availability** - Calendar, pricing, allotments, transfers (with NEW badge)
3. **Revenue & Finance** - Sales, earnings, payouts, commissions, invoices
4. **Collaboration & Leads** - Quotes (with pending badge), leads, chat (with unread badge)
5. **Compliance & Support** - Verification, documents, safety, help

### Client (Traveler Experience)

#### My Trips
- **Upcoming** - Next trips with NEXT badge
- **Past Trips** - Travel history
- **Saved Plans** - Bookings in progress

#### Quick Stats Widget
- **Upcoming Trips** - Scheduled travels (2)
- **Saved Plans** - Draft itineraries (5)
- **Total Trips** - Lifetime bookings (12)
- **Rewards** - Loyalty points (3)

#### Quick Actions
- **Plan New Trip** - Start trip planning
- **My Bookings** - View reservations
- **Upcoming Trips** - Quick access with count (2)

#### Sections
1. **Plan & Book** - Destinations, packages, flights, stays, cars, tours
2. **Collaborate & Quote** - Quote builder, itinerary, chat (with unread badge)
3. **Manage Bookings** - Reservations, payment, vouchers, invoices
4. **Notifications & Help** - Messages (with NEW badge), reminders, safety
5. **Reviews & Feedback** - Share experiences

## Smart Badge System

### Badge Types

| Badge | Color | Pulse | Use Case |
|-------|-------|-------|----------|
| `LIVE` | Green | ✓ | Real-time dashboards |
| `NEW` | Blue | - | New items/features |
| `!` | Orange | - | Pending actions |
| `•` | Red | ✓ | Unread messages |
| `→` | Brand Orange | - | Next scheduled item |

### Implementation

```javascript
// In sidebar.config.js
{
  name: "Dashboard",
  icon: "LayoutDashboard",
  route: "/partner/dashboard",
  badge: "live"  // Adds pulsing green LIVE badge
}
```

## Notification System

### Header Notification Bell
- Real-time unread count display
- Role-specific routing:
  - **Admin** → `/admin/dashboard`
  - **Partner** → `/partner/chat`
  - **Client** → `/client/notifications`

### Visual Indicators
- Red badge with count
- Pulsing animation for urgent items
- Auto-updates on data sync

## Quick Stats Dashboard

### Purpose
Provide at-a-glance metrics for operational decision-making

### Admin Metrics
- Active operations count
- Pending approval items
- Partner network size
- System health status

### Partner Metrics
- New booking count
- Confirmed reservations
- Period earnings
- Product visibility

### Client Metrics
- Upcoming trip count
- Saved itinerary count
- Lifetime trip count
- Reward points balance

## Quick Actions System

### Design Philosophy
One-click access to most frequently performed operations based on role analytics

### Admin Actions
- Review pending partners (with count)
- Check today's bookings

### Partner Actions
- View new bookings (with count)
- Update availability calendar
- Check earnings dashboard

### Client Actions
- Plan new trip
- View active bookings
- Check upcoming trips (with count)

## Configuration Guide

### Adding New Section

```javascript
// In src/config/sidebar.config.js
{
  title: "New Section Name",
  icon: "IconName",  // From lucide-react
  description: "Brief description",
  items: [
    {
      name: "Menu Item",
      icon: "IconName",
      route: "/path/to/page",
      badge: "live"  // Optional: live, new, pending, unread, next
    }
  ]
}
```

### Supported Icons

All icons from `lucide-react`:
- `LayoutDashboard`, `BarChart3`, `TrendingUp`
- `Users`, `Users2`, `Briefcase`
- `CalendarCheck`, `MapPin`, `Map`
- `Wallet`, `Tag`, `Gift`
- `MessageSquare`, `Bell`, `Activity`
- `Shield`, `ShieldCheck`, `Settings`
- `FileText`, `Clock3`, `HelpCircle`
- `Car`, `Plane`, `Mountain`, `BedDouble`
- `Star`, `Bookmark`, `CheckCircle2`
- And more...

## Best Practices

### For CollEco Admins
1. Monitor pending badges daily
2. Keep quick stats visible for platform health
3. Use quick actions for high-frequency tasks
4. Review notification center regularly

### For Partners
1. Check new bookings badge immediately
2. Update availability proactively
3. Monitor earnings for payment cycles
4. Respond to chat notifications promptly
5. Keep documents current in compliance section

### For Clients
1. Review upcoming trips before travel
2. Save interesting itineraries
3. Use chat for real-time support
4. Check notifications for booking updates
5. Provide feedback after trips

## Performance Optimization

### Real-Time Updates
- Stats refresh every 60 seconds
- Notification counts update on navigation
- Badges update on data sync events

### Lazy Loading
- Navigation sections expand on demand
- Icons loaded from component library
- Routes lazy-loaded on click

### Responsive Design
- Mobile: Full-screen overlay
- Desktop: Hover-to-expand sidebar
- Tablet: Pinnable sidebar

## Integration Points

### API Endpoints
- `/api/stats/admin` - Admin dashboard metrics
- `/api/stats/partner` - Partner performance data
- `/api/stats/client` - Client activity summary
- `/api/notifications/count` - Unread notification count
- `/api/bookings/pending` - Pending booking count

### Event System
```javascript
// Listen for sidebar events
window.addEventListener('toggle-sidebar', handler);
window.addEventListener('open-sidebar', handler);
window.addEventListener('close-sidebar', handler);

// Trigger sidebar actions
window.dispatchEvent(new Event('toggle-sidebar'));
```

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader announcements for badges
- High contrast badge colors
- Focus management on open/close

## Future Enhancements

### Planned Features
- [ ] Customizable quick action slots
- [ ] Drag-and-drop section reordering
- [ ] Favorite/pin frequently used items
- [ ] Search within sidebar navigation
- [ ] Recent activity history
- [ ] Smart recommendations based on usage
- [ ] Integration with AI assistant
- [ ] Voice-activated navigation
- [ ] Offline mode indicators
- [ ] Multi-workspace switching

### Under Consideration
- Dark mode theme
- Compact view option
- Export stats to CSV
- Custom badge colors
- Notification filtering
- Scheduled quick actions

## Support

For sidebar configuration issues:
- Check `src/config/sidebar.config.js`
- Verify route exists in `src/config/pages.json`
- Ensure icon name matches lucide-react exports
- Review console for navigation errors

## Success Metrics

### Client Service KPIs
- Time to find booking: < 3 seconds
- Navigation satisfaction: > 95%
- Quick action usage: > 70%

### Partner Satisfaction KPIs
- Booking response time: < 5 minutes
- Availability update frequency: Daily
- Earnings visibility: Real-time

### CollEco Operations KPIs
- Partner approval time: < 24 hours
- System monitoring: 24/7
- Platform uptime: > 99.5%

---

**Last Updated:** December 14, 2025
**Version:** 2.0 - Enhanced Operations
**Maintainer:** CollEco Development Team
