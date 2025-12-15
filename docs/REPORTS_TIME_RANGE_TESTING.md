# Reports & Performance Time Range Testing Guide

## 🎯 What Was Fixed

The Reports & Performance page now properly responds to time range selections (7 Days, 30 Days, 90 Days). Previously, the data was static and didn't change regardless of which button was clicked.

## ✅ How It Works Now

### Time Range Scaling
- **7 Days:** Shows ~25% of the 30-day baseline (smaller numbers)
- **30 Days:** Shows baseline numbers (medium - default)
- **90 Days:** Shows ~350% of baseline (larger numbers - 3 months of data)

### Example Expected Changes

When you click between time ranges, you should see these approximate changes:

| Metric | 7 Days | 30 Days | 90 Days |
|--------|--------|---------|---------|
| **Total Bookings** | ~59 | ~234 | ~819 |
| **Revenue** | ~R 39,195 | ~R 156,780 | ~R 548,730 |
| **Active Customers** | ~184 | ~737 | ~2,580 |
| **Cape Town Bookings** | ~20 | ~78 | ~273 |
| **Confirmed Bookings** | ~36 | ~142 | ~497 |

## 🧪 Testing Steps

### 1. Clear Browser Cache (Optional but Recommended)
Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac) to hard refresh

### 2. Seed Demo Data (If You Haven't Already)
```javascript
// Open browser console (F12)
// Copy and paste contents of: scripts/seed-demo-data.js
// Then refresh the page
```

### 3. Navigate to Reports Page
- Go to the Reports & Performance page
- Look for the time range buttons: **7 Days | 30 Days | 90 Days**

### 4. Test Time Range Changes

**Step 1:** Click **30 Days** (default - baseline)
- Note the "Total Bookings" number
- Note the "Revenue" number
- Open browser console (F12) and look for: `📊 Reports: Time range changed to 30d`

**Step 2:** Click **7 Days**
- Total Bookings should **decrease** to ~25% of the 30-day value
- Revenue should **decrease** proportionally
- Console should show: `📊 Reports: Time range changed to 7d`
- Cards should briefly dim during the update (loading state)

**Step 3:** Click **90 Days**
- Total Bookings should **increase** to ~3.5x the 30-day value
- Revenue should **increase** proportionally
- All sections should update:
  - **Booking Trends** (Confirmed/Pending/Cancelled counts)
  - **Revenue Breakdown** (Accommodation/Tours/Transport)
  - **Popular Destinations** (booking counts per destination)
- Console should show: `📊 Reports: Time range changed to 90d`

**Step 4:** Switch back to **30 Days**
- Numbers should return to the baseline values you noted in Step 1

## 🔍 What to Look For

### ✅ Correct Behavior
- [ ] Numbers change immediately when clicking time range buttons
- [ ] 7 Days shows smaller numbers than 30 Days
- [ ] 90 Days shows larger numbers than 30 Days
- [ ] Cards briefly dim (opacity change) during updates
- [ ] Console logs show time range changes
- [ ] All sections update together:
  - Top metrics cards
  - Booking Trends
  - Revenue Breakdown
  - Popular Destinations

### ❌ Incorrect Behavior (Should NOT Happen)
- Numbers stay the same when clicking different time ranges
- Console errors appear
- Page layout breaks
- Only some sections update while others don't

## 📊 With Real Data (After Seeding)

If you've run the seed script, the Reports page will use actual localStorage data:

### Expected 7-Day Range (Recent Data Only)
- Should show only bookings from the last 7 days
- Most data will be from: BK003, BK007, BK008, BK009
- Popular destination: Cape Town (2 bookings)

### Expected 30-Day Range (Default)
- Shows all bookings from last 30 days
- Includes: BK001-BK010
- Popular destination: Cape Town (3 bookings)

### Expected 90-Day Range (Full History)
- Includes all bookings + travel history
- Cape Town should have highest count (5+ entries)

## 🐛 Troubleshooting

### Numbers Don't Change
1. **Check Console:** Press F12, look for `📊 Reports: Time range changed to X`
   - If you see the log: React state is updating correctly
   - If NO log: Button onClick might not be working

2. **Clear localStorage and Re-seed:**
   ```javascript
   // In browser console:
   localStorage.clear();
   // Then paste seed-demo-data.js contents
   // Refresh page
   ```

3. **Hard Refresh:** `Ctrl + Shift + R` to bypass cache

### Numbers Are the Same for All Ranges
- This might mean localStorage is empty
- Run the seed script again
- Check console for: `✅ Demo data seeded successfully!`

### Only Demo Data Shows (Even After Seeding)
- Check if seed script actually wrote to localStorage:
  ```javascript
  // In console:
  JSON.parse(localStorage.getItem('colleco.bookings')).length
  // Should return 10
  ```

## 🎓 Technical Details

### How It Works

1. **Time Range State:** `useState('30d')` stores the current selection
2. **useEffect Hook:** Runs whenever `timeRange` changes (dependency: `[timeRange]`)
3. **Date Filtering:** Calculates cutoff date based on selected range:
   - `7d` → Last 7 days
   - `30d` → Last 30 days
   - `90d` → Last 90 days
4. **Data Processing:**
   - Filters bookings and travel history by date
   - Recalculates all metrics (totals, breakdowns, destinations)
5. **Demo Data Scaling:** When localStorage is empty:
   - `7d` → multiplies baseline by 0.25
   - `30d` → uses baseline (1x)
   - `90d` → multiplies baseline by 3.5

### Code Changes Made
- Added `isLoading` state for visual feedback
- Implemented time-range-based scaling for demo data
- Added `setTimeout` to create brief loading effect (150ms)
- Applied opacity transition to metrics grid
- Added console logging for debugging

## 📝 Expected Console Output

When testing, your console should show:

```
📊 Reports: Time range changed to 30d
📊 Reports: Time range changed to 7d
📊 Reports: Time range changed to 90d
📊 Reports: Time range changed to 30d
```

Each time you click a time range button, you should see a new log entry.

## ✨ Live Deployment Notes

For production deployment with real live data:
- Remove or reduce console logging
- Consider caching calculated metrics
- Add actual conversion rate calculation (currently hardcoded at 18.4%)
- Connect to real backend APIs for up-to-date stats
- Implement data export functionality for "Download" buttons

---

**Summary:** The Reports page now dynamically calculates and displays metrics based on the selected time range, providing realistic demo behavior that prepares the platform for live data integration.
