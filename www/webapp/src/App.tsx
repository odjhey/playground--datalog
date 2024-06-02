/* eslint-disable @typescript-eslint/no-explicit-any */
import { edn } from "@app/core";
import "./App.css";
import { StateProvider } from "./contexts/store-context";
import { useAppState } from "./hooks/use-store";
import { useState } from "react";

function App() {
  return (
    <StateProvider>
      <Component />
    </StateProvider>
  );
}

function Component() {
  const [user, setUser] = useState<{ name: string; age: number }>({
    name: "",
    age: 0,
  });
  const { t, q, history, replay } = useAppState();

  const query = edn`[:find ?e ?name
        :where 
          [?e "name" ?name]]`;

  const result = (q(query) as unknown[]).map((v: any) => {
    return { key: v[0], name: v[1] };
  });

  return (
    <div>
      {result.map((v) => {
        return (
          <div key={v.key}>
            {v.key}: {v.name}
            <button
              onClick={() => {
                t([[":db/retractEntity", v.key]]);
              }}
            >
              x
            </button>
          </div>
        );
      })}
      name:{" "}
      <input
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
      />
      age:{" "}
      <input
        type="number"
        value={isNaN(user.age) ? 0 : user.age}
        onChange={(e) => setUser({ ...user, age: parseInt(e.target.value) })}
      />
      <button
        onClick={() => {
          if (user?.name && user?.age) {
            t([{ ":db/add": -1, ...user }]);
          }
        }}
      >
        add
      </button>
      <button
        onClick={() => {
          replay(history().map((v) => JSON.parse(v as string)));
        }}
      >
        replay
      </button>
    </div>
  );
}

export default App;
