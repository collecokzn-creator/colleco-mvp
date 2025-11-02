import React from "react";

const mockInsights = [
  {
    id: 1,
    title: "Top-Selling Destination",
    detail: "Durban Beach Resort (+12% growth)",
    highlight: true,
  },
  {
    id: 2,
    title: "Smart Alert",
    detail: "3 partner listings need compliance updates.",
    highlight: false,
  },
];

const InsightsPanel = () => (
  <div className="bg-white rounded-2xl shadow-md p-4">
    <h3 className="font-medium text-lg text-brand-orange mb-3">AI Insights</h3>
    <ul className="space-y-3">
      {mockInsights.map((insight) => (
        <li key={insight.id} className={`p-3 rounded-xl ${insight.highlight ? 'bg-brand-gold text-brand-orange font-bold' : 'bg-brand-gold/10 text-brand-gold'}`}>
          <div className="text-sm">{insight.title}</div>
          <div className="text-xs opacity-80">{insight.detail}</div>
        </li>
      ))}
    </ul>
  </div>
);

export default InsightsPanel;
