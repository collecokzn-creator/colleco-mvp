function formatCurrency(amount, currency = "USD", locale = "en-US", opts = {}) {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2, ...opts }).format(Number(amount) || 0);
  } catch {
    const a = (Number(amount) || 0).toFixed(2);
    return `${currency} ${a}`;
  }
}
export {
  formatCurrency as f
};
//# sourceMappingURL=currency-J2bxD4Bj.js.map
