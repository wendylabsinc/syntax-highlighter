import { SyntaxHighlighterPanel } from "@syntax-highlighter/shared";
import { adobeAdapter } from "./adobe-adapter";

export const App = () => {
  return <SyntaxHighlighterPanel adapter={adobeAdapter} />;
};
