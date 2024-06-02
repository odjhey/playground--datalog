import * as d from "datascript"; // version "1.6.5"
import { edn } from "./edn-template-tag";

export { edn };
export const store = (
  hydrateValue: string | undefined,
  {
    storage,
    history,
    listeners,
  }: {
    storage: {
      save: (v: string) => void;
    };
    history: {
      append: (v: string) => void;
    };
    listeners: { [key: string]: (v: any) => void };
  }
) => {
  const snapshot = hydrateValue ? JSON.parse(hydrateValue) : undefined;
  const db = snapshot ? d.from_serializable(snapshot) : d.empty_db();
  const conn = db ? d.conn_from_db(db) : d.create_conn();
  let __listeners = listeners;

  d.listen(conn, "main", (r) => {
    const value = d.serializable(r.db_after);
    storage.save(JSON.stringify(value));
    const listenerKeys = Object.keys(__listeners);
    listenerKeys.forEach((k) => {
      __listeners[k](value);
    });
  });

  const self = {
    conn,
    addListener: (key: string, listener: (v: any) => void) => {
      __listeners[key] = listener;
      return () => {
        delete __listeners[key];
      };
    },
    history: {
      // @todo id's are temporary in history, so without dropping the DB, this is not isomorphic
      replay: (transactions: { tx: number; query: unknown[] }[]) => {
        transactions.forEach((tx) => {
          d.transact(conn, tx.query);
        });
      },
    },

    // @todo exposing transact is temporary
    t: (query: unknown[]) => {
      const result = d.transact(conn, query);
      const { tx_data, tempids } = result;
      history.append(
        JSON.stringify({ tx: Date.now(), query, __meta: { tx_data, tempids } })
      );
    },

    // @todo exposing query is temporary
    q: (query: string, ...rest: unknown[]) => {
      return d.q(query, d.db(conn), ...rest);
    },
  };

  return self;
};
