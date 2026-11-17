import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css"
import "@radix-ui/themes/styles.css";
import {Theme} from "@radix-ui/themes";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <Theme accentColor={"iris"}  appearance="dark">
        <App/>
    </Theme>
);
