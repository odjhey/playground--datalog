/* eslint-disable @typescript-eslint/no-explicit-any */
import { edn } from "@app/core";
import { useState } from "react";
import { useAppState } from "../hooks/use-store";

export function HomePage() {
  const [user, setUser] = useState<{ name: string; age: number }>({
    name: "",
    age: 0,
  });
  const { t, q, history, replay } = useAppState();

  const query = edn`[:find ?e ?name ?age
        :where 
          [?e "name" ?name]
          [?e "age" ?age]
        ]`;

  const result = (q(query) as unknown[]).map((v: any) => {
    return { key: v[0], name: v[1], age: v[2] };
  });

  return (
    <div className="m-2 flex flex-col gap-2">
      <div className="flex flex-row gap-2">
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
      {result.map((v) => {
        return (
          <div className="flex flex-row gap-2" key={v.key}>
            {v.key}: {v.name} {v.age}
            <button
              className="btn btn-xs btn-error"
              onClick={() => {
                t([[":db/retractEntity", v.key]]);
              }}
            >
              x
            </button>
          </div>
        );
      })}
    </div>
  );
}
