import { edn } from "@app/core";
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
  const { value, t, q } = useAppState();

  const query = edn`[:find ?e ?name ?age 
        :where 
          [?e "name" ?name] 
          [?e "age" ?age]]`;
  return (
    <div>
      <div>{JSON.stringify(value)}</div>
      <div>{JSON.stringify(q(query))}</div>

      <button
        onClick={() => {
          t([{ ":db/add": -1, name: "james", age: 99 }]);
        }}
      >
        add
      </button>
    </div>
  );
}

export default App;
