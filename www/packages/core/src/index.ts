import * as d from "datascript"; // version "1.6.5"
import { edn } from "./edn-template-tag";

export { edn };
export const store = (
  hydrateValue: string | undefined,
  {
    storage,
    listeners,
  }: {
    storage: { save: (v: string) => void };
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

    // @todo exposing transact is temporary
    t: (query: unknown[]) => {
      d.transact(conn, query);
    },

    // @todo exposing query is temporary
    q: (query: string, ...rest: unknown[]) => {
      return d.q(query, d.db(conn), ...rest);
    },
  };

  return self;
};
