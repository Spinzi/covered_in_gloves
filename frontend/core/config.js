export const WEBSOCKET_URL = "ws://192.168.1.230:1520";

export const sidebarConfigDefault = {
  entries: [
    { type: "button", label: "Home", action: "go-home" },

    { type: "header", label: "Administrator" },

    { type: "button", label: "Dashboard", action: "go-dashboard" },
    { type: "button", label: "Log out", action: "logout" },

    { type: "space" },

    { type: "button", label: "Today", action: "go-today" },
    { type: "button", label: "History", action: "go-history" },
  ],
};

export const sidebarConfigAuth = {
  entries: [
    { type: "message", label: "Please log in in order to access the sidebar." }
  ],
};

export const sidebarConfigWithSave = {
  entries: [
    { type: "button", label: "Home", action: "go-home" },
    { type: "button", label: "Save", action: "save"},

    { type: "header", label: "Administrator" },

    { type: "button", label: "Dashboard", action: "go-dashboard" },
    { type: "button", label: "Log out", action: "logout" },

    { type: "space" },

    { type: "button", label: "Today", action: "go-today" },
    { type: "button", label: "History", action: "go-history" },
  ],
};
