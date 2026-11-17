import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css"
import "@radix-ui/themes/styles.css";
import {Theme} from "@radix-ui/themes";
import { ThemeProvider } from "next-themes";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <ThemeProvider attribute="class">
        <Theme accentColor={"grass"} appearance="dark">
            <App/>
        </Theme>
    </ThemeProvider>
);
