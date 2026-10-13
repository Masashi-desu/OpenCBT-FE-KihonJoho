import { createRoot } from "react-dom/client";
import { App } from "./ui/App";
import { applyTheme, readTheme } from "./ui/theme";
import { installOverlayScrollbars } from "./ui/scrollbars";
import "./ui/style.css";
applyTheme(readTheme());
createRoot(document.getElementById("root")!).render(<App />);
const removeScrollbars = installOverlayScrollbars();
import.meta.hot?.dispose(removeScrollbars);
