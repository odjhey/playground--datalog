import * as d from "datascript"; // version "1.6.5"
import { edn } from "./edn-template-tag";

export const helloWorld = () => "yaharu";

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

  const query = edn`[:find ?e ?name ?age 
        :where 
          [?e "name" ?name] 
          [?e "age" ?age]]`;

  d.listen(conn, "main", (r) => {
    const value = d.serializable(r.db_after);
    storage.save(JSON.stringify(value));
    const listenerKeys = Object.keys(__listeners);
    listenerKeys.forEach((k) => {
      __listeners[k](d.q(query, r.db_after));
    });
  });

  const addEntity = (conn: any, e: { name: string; age: number }) => {
    const { name, age } = e;
    d.transact(conn, [{ ":db/add": -1, name, age }]);
  };

  const removeEntity = (conn: any, e: { id: number }) => {
    const { id } = e;
    d.transact(conn, [[":db/retractEntity", id]]);
  };

  // console.log(d.q(`[:find ?e ?a ?v :where [?e ?a ?v]]`, d.db(conn)));

  const self = {
    conn,
    add: (e: { name: string; age: number }) => addEntity(conn, e),
    remove: (e: { id: number }) => removeEntity(conn, e),
    addListener: (key: string, listener: (v: any) => void) => {
      __listeners[key] = listener;
      return () => {
        delete __listeners[key];
      };
    },
    q: () => {
      return d.q(query, d.db(conn));
    },
  };

  return self;
};
