"use client";

import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const COLORS = ["#7C3ABE", "#C4235C", "#D4A017", "#0F6B45", "#2563EB"];

interface DashboardChartsProps {
  leadsByDay: { day: string; leads: number }[];
  packagesByCategory: { name: string; value: number }[];
}

export function DashboardCharts({ leadsByDay, packagesByCategory }: DashboardChartsProps) {
  return (
    <div className="admin-grid-2" style={{ marginTop: 16 }}>
      <div className="admin-card">
        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 500 }}>Leads (7 days)</h3>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={leadsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="leads" stroke="#7C3ABE" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="admin-card">
        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 500 }}>Packages by category</h3>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={packagesByCategory}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name} (${value})`}
              >
                {packagesByCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
