import { createLazyFileRoute } from "@tanstack/react-router";
import { StateProvider } from "../contexts/store-context";
import { HistoryPage } from "../pages/history-page";

export const Route = createLazyFileRoute("/history")({
  component: History,
});

function History() {
  return (
    <StateProvider>
      <HistoryPage></HistoryPage>
    </StateProvider>
  );
}
