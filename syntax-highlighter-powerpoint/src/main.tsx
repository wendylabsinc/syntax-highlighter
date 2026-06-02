import React from "react";
import ReactDOM from "react-dom/client";
import { SyntaxHighlighterPanel } from "@syntax-highlighter/shared";
import { powerpointAdapter } from "./powerpoint-adapter";
import "./styles.css";

const rootElement = document.getElementById("app");
if (!rootElement) throw new Error("Missing #app mount element.");

const render = () => {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <SyntaxHighlighterPanel
        adapter={powerpointAdapter}
        initialBackgroundColor="#202124"
      />
    </React.StrictMode>,
  );
};

const office = (globalThis as any).Office as
  | { onReady?: () => Promise<unknown> }
  | undefined;

if (office?.onReady) {
  office.onReady().then(render).catch(render);
} else {
  render();
}
