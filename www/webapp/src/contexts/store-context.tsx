/* eslint-disable @typescript-eslint/no-explicit-any */
import { store } from "@app/core";
import { PropsWithChildren, createContext, useEffect, useState } from "react";

const STORAGE_KEY = "www-datascript-playground-test-data000001";
const HISTORY_STORAGE_KEY = "www-datascript-playground-test-history000001";

const s = store(localStorage.getItem(STORAGE_KEY) ?? undefined, {
  history: {
    append: (v) => {
      const existing = localStorage.getItem(HISTORY_STORAGE_KEY);
      const arr = existing ? JSON.parse(existing) : [];
      arr.push(v);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(arr));
    },
  },
  storage: {
    save: (v) => {
      localStorage.setItem(STORAGE_KEY, v);
    },
  },
  listeners: {},
});

export const StateContext = createContext<
  | {
      t: (t: unknown[]) => void;
      q: (query: string, ...sources: any[]) => any;
      replay: (transactions: { tx: number; query: unknown[] }[]) => any;
      history: () => unknown[];
    }
  | undefined
>(undefined);

export const StateProvider = (props: PropsWithChildren) => {
  const [, setState] = useState();

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
        t: (t) => {
          s.t(t);
        },
        q: s.q,
        replay: s.history.replay,
        history: () =>
          JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) ?? "[]"),
      }}
    >
      {props.children}
    </StateContext.Provider>
  );
};
