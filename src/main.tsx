import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css"
import "@radix-ui/themes/styles.css";
import {Theme} from "@radix-ui/themes";
import {ThemeProvider} from "next-themes";
import ToastSystem from "./components/ToastSystem";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Theme appearance="inherit"
               accentColor="indigo"
               grayColor="slate"
               radius="medium">
            <App/>
            <ToastSystem />
        </Theme>
    </ThemeProvider>
);
