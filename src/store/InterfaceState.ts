import {create} from "zustand";
import {subscribeWithSelector} from "zustand/middleware";

export interface InterfaceState {
    sidebarVisibility: boolean;
    setSidebarVisibility: (bool: boolean) => void;
}

const useInterface = create<InterfaceState>()(
    subscribeWithSelector((set) => ({
        sidebarVisibility: false,
        setSidebarVisibility: (bool: boolean) => set({sidebarVisibility: bool}),
    }))
);

export default useInterface;