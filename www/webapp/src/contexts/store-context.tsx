/* eslint-disable @typescript-eslint/no-explicit-any */
import { store } from "@app/core";
import { PropsWithChildren, createContext, useEffect, useState } from "react";

const STORAGE_KEY = "www-datascript-playground-test-data000001";

const s = store(localStorage.getItem(STORAGE_KEY) ?? undefined, {
  storage: {
    save: (v) => {
      localStorage.setItem(STORAGE_KEY, v);
    },
  },
  listeners: {},
});

export const StateContext = createContext<
  | {
      value: any;
      add: () => void;
      t: (t: unknown[]) => void;
      q: (query: string, ...sources: any[]) => any;
    }
  | undefined
>(undefined);

export const StateProvider = (props: PropsWithChildren) => {
  const [state, setState] = useState(s.qAll());

  useEffect(() => {
    const unsubscribe = s.addListener("main", (v: any) => {
      setState(v);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <StateContext.Provider
      value={{
        value: state,
        add: () => {
          s.add({ name: "ju", age: 2 });
        },
        t: (t) => {
          s.t(t);
        },
        q: s.q,
      }}
    >
      {props.children}
    </StateContext.Provider>
  );
};
