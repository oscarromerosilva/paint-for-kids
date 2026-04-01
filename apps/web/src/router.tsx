import { createBrowserRouter } from "react-router";

import AppShell from "./app-shell";
import Draw from "./routes/draw";

function NotFound() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-semibold text-2xl">404</h1>
      <p className="text-muted-foreground">
        The requested page could not be found.
      </p>
    </main>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Draw /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
