import React from "react";

export default function RootLayout({ children }) {
  return (
    <div>
      <header>
        <h1>CollEco Travel</h1>
      </header>
      <main>{children}</main>
      <footer>
        <p>© {new Date().getFullYear()} CollEco Travel</p>
      </footer>
    </div>
  );
}