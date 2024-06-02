import { z } from "zod";
import { useAppState } from "../hooks/use-store";

const SCHEMA = z.object({
  tx: z.number(),
  query: z.array(z.any()),
});

const jsonStringSchema = z.array(
  z.string().transform((str) => {
    try {
      const parsed = JSON.parse(str);
      return SCHEMA.parse(parsed); // This will throw if the parsed object doesn't match the schema
    } catch (e) {
      throw new Error("Invalid JSON string or schema mismatch");
    }
  })
);

export function HistoryPage() {
  const { history } = useAppState();

  const result = jsonStringSchema.safeParse(history());

  if (!result.success) {
    console.error(result.error);
    return "Failed to interpret history.";
  }

  return (
    <div className="m-2 flex flex-col gap-2">
      {result.data
        .sort((a, b) => b.tx - a.tx)
        .map((v) => {
          return (
            <div className="flex flex-row gap-2" key={v.tx}>
              {v.tx}: {JSON.stringify(v.query)}
            </div>
          );
        })}
    </div>
  );
}
