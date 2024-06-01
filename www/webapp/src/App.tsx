import { useState } from "react";
import "./App.css";
import { store } from "@app/core";

const STORAGE_KEY = "www-datascript-playground-test-data000001";

const s = store(localStorage.getItem(STORAGE_KEY) ?? undefined, {
  storage: {
    save: (v) => {
      console.log("save", v);
      localStorage.setItem(STORAGE_KEY, v);
    },
  },
});

function App() {
  const [a, setA] = useState(s.q);
  return (
    <div>
      {JSON.stringify(a)}
      <button
        onClick={() => {
          s.add({ name: "ju", age: 2 });
        }}
      >
        add
      </button>
      <button
        onClick={() => {
          setA(s.q());
        }}
      >
        refresh
      </button>
    </div>
  );
}

export default App;
