import "./App.css";
import { StateProvider } from "./contexts/store-context";
import { useAppState } from "./hooks/use-store";

function App() {
  return (
    <StateProvider>
      <Component />
    </StateProvider>
  );
}

function Component() {
  const { value, add } = useAppState();
  return (
    <div>
      {JSON.stringify(value)}
      <button
        onClick={() => {
          add();
        }}
      >
        add
      </button>
    </div>
  );
}

export default App;
