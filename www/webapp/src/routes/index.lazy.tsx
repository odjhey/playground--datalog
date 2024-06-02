import { createLazyFileRoute } from "@tanstack/react-router";
import { HomePage } from "../pages/home-page";
import { StateProvider } from "../contexts/store-context";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <StateProvider>
      <HomePage></HomePage>
    </StateProvider>
  );
}
