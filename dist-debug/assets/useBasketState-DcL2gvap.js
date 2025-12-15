import { r as reactExports } from "./motion-D9fZRtSt.js";
import { f as useLocalStorageState } from "./index-DlOecmR0.js";
function smartDayAssignment(item, currentBasket) {
  const category = (item.category || "").toLowerCase();
  const maxDay = currentBasket.length > 0 ? Math.max(...currentBasket.map((i) => i.day || 1)) : 0;
  if (category === "lodging" || category === "accommodation" || category.includes("hotel")) {
    const lastLodging = currentBasket.filter((i) => ["lodging", "accommodation"].includes((i.category || "").toLowerCase()) || (i.category || "").includes("hotel")).sort((a, b) => (b.day || 1) - (a.day || 1))[0];
    if (lastLodging) {
      const nightsMatch = (lastLodging.title || "").match(/(\d+)\s*night/i);
      const nights = nightsMatch ? parseInt(nightsMatch[1]) : 1;
      return (lastLodging.day || 1) + nights;
    }
    return maxDay + 1 || 1;
  }
  if (category === "activity" || category === "tour" || category === "experience") {
    const title = (item.title || "").toLowerCase();
    const desc = (item.description || "").toLowerCase();
    const text = title + " " + desc;
    let suggestedTime = "Flexible";
    if (text.match(/morning|breakfast|sunrise|early/i)) suggestedTime = "Morning";
    else if (text.match(/afternoon|lunch|midday/i)) suggestedTime = "Afternoon";
    else if (text.match(/evening|dinner|sunset|night/i)) suggestedTime = "Evening";
    item.time = suggestedTime;
    const daysMatch = text.match(/(\d+)[-\s]*day/i);
    if (daysMatch) {
      const tourDays = parseInt(daysMatch[1]);
      if (tourDays > 1) {
        return maxDay + 1 || 1;
      }
    }
    const currentDayItems = currentBasket.filter((i) => i.day === maxDay);
    return currentDayItems.length >= 4 ? maxDay + 1 : maxDay || 1;
  }
  if (category === "dining" || category.includes("food") || category.includes("restaurant")) {
    const title = (item.title || "").toLowerCase();
    if (title.includes("breakfast")) {
      item.time = "Morning";
    } else if (title.includes("lunch")) {
      item.time = "Afternoon";
    } else if (title.includes("dinner")) {
      item.time = "Evening";
    } else {
      item.time = "Flexible";
    }
    return maxDay || 1;
  }
  if (category === "transport" || category === "flight" || category.includes("transfer")) {
    const title = (item.title || "").toLowerCase();
    if (title.includes("return") || title.includes("departure")) {
      return maxDay + 1 || 1;
    }
    item.time = "Morning";
    return 1;
  }
  return maxDay || 1;
}
function useBasketState() {
  const [basket, setBasket] = useLocalStorageState("basket:v1", []);
  const addToBasket = reactExports.useCallback((item) => {
    setBasket((prev) => {
      if (!item?.id) return prev;
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i);
      }
      const assignedDay = item.day || smartDayAssignment(item, prev);
      return [...prev, { ...item, quantity: item.quantity || 1, price: Number(item.price || 0), day: assignedDay, time: item.time || "Flexible" }];
    });
  }, [setBasket]);
  const removeFromBasket = reactExports.useCallback((id) => {
    setBasket((prev) => prev.filter((i) => i.id !== id));
  }, [setBasket]);
  const updateQuantity = reactExports.useCallback((id, qty) => {
    setBasket((prev) => prev.map((i) => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i));
  }, [setBasket]);
  const updateItem = reactExports.useCallback((id, patch) => {
    setBasket((prev) => prev.map((i) => i.id === id ? { ...i, ...patch } : i));
  }, [setBasket]);
  const updateDay = reactExports.useCallback((id, day) => {
    setBasket((prev) => prev.map((i) => i.id === id ? { ...i, day: Math.max(1, Number(day) || 1) } : i));
  }, [setBasket]);
  const reorderWithin = reactExports.useCallback((idsInNewOrder) => {
    setBasket((prev) => {
      const map = new Map(prev.map((i) => [i.id, i]));
      const used = /* @__PURE__ */ new Set();
      const next = [];
      idsInNewOrder.forEach((id) => {
        if (map.has(id)) {
          next.push(map.get(id));
          used.add(id);
        }
      });
      prev.forEach((i) => {
        if (!used.has(i.id)) next.push(i);
      });
      return next;
    });
  }, [setBasket]);
  const clearBasket = reactExports.useCallback(() => setBasket([]), [setBasket]);
  const paidItems = basket.filter((i) => Number(i.price) > 0);
  return { basket, addToBasket, removeFromBasket, updateQuantity, updateItem, updateDay, reorderWithin, clearBasket, paidItems };
}
export {
  useBasketState as u
};
//# sourceMappingURL=useBasketState-DcL2gvap.js.map
