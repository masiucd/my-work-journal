import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { format, parseISO } from "date-fns";
import type { PropsWithChildren } from "react";
import { EntryForm } from "~/components/entry-form";
import { insertEntry } from "~/database/queries/entries.server";
import { insertSchema } from "~/database/schema/entries.server";
import { getSession } from "~/session.server";
import { validateAdmin } from "~/utils/validate-admin.server";
import { EntryFormWrapper } from "~/components/entry-form-wrapper";
import { getThemeCookie } from "~/utils/theme.server";
import { getEntries } from "./entreis";

export const meta: MetaFunction = () => [
  { title: "My working journal" },
  {
    name: "description",
    content: "Here where I journal my progress as a developer",
  },
];

export async function action({ request }: ActionFunctionArgs) {
  await validateAdmin(request);
  let formData = await request.formData();
  let date = formData.get("date");
  let type = formData.get("type");
  let text = formData.get("text");
  if (
    typeof date !== "string" ||
    typeof type !== "string" ||
    typeof text !== "string"
  ) {
    throw new Error("Bad request");
  }
  let newEntry = insertSchema.parse({ date: new Date(date), type, text });
  return await insertEntry(newEntry);
}

export async function loader({ request }: LoaderFunctionArgs) {
  let session = await getSession(request.headers.get("Cookie"));
  return {
    loggedIn: !!session.data.admin,
    theme: await getThemeCookie(request),
    ...(await getEntries()),
  };
}

export default function EntriesListPage() {
  let { entries, loggedIn, theme } = useLoaderData<typeof loader>();
  return (
    <>
      {loggedIn && (
        <EntryFormWrapper>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            New entry
          </p>
          <EntryForm theme={theme} />
        </EntryFormWrapper>
      )}
      <ol className="mx-2 flex flex-col gap-6 border-l-2 border-primary-400/15 pl-5">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <li key={entry.dateString} className="relative flex flex-col gap-3">
              <Circle />
              <strong className="mb-2 pt-[2.5px] text-xs font-semibold uppercase tracking-wide text-primary-400">
                {format(parseISO(entry.dateString), "MMMM do, yyyy")}
              </strong>
              <Entries entries={entry.work} title="Work" />
              <Entries
                entries={entry.interestingThing}
                title="Interesting thing"
              />
              <Entries entries={entry.learning} title="Learning" />
            </li>
          ))
        ) : (
          <p className="text-center">No entries yet</p>
        )}
      </ol>
    </>
  );
}

function Circle() {
  return (
    <div className="absolute left-[-27px] top-0 bg-gray-100 py-1 dark:bg-gray-950 ">
      <div className="h-3 w-3 rounded-full border border-primary-400 bg-gray-900" />
    </div>
  );
}

type LoaderReturnType = Awaited<ReturnType<typeof loader>>["entries"][number];
type EntryType =
  | LoaderReturnType["interestingThing"][number]
  | LoaderReturnType["work"][number]
  | LoaderReturnType["learning"][number];

function Entries({ entries, title }: { entries: EntryType[]; title: string }) {
  return (
    entries.length > 0 && (
      <EntryWrapper title={title}>
        <EntryList>
          {entries.map((entry) => (
            <EntryItem key={entry.id} entry={entry} />
          ))}
        </EntryList>
      </EntryWrapper>
    )
  );
}

function EntryWrapper({
  children,
  title,
}: PropsWithChildren<{ title: string }>) {
  return (
    <div className="mb-3">
      <p className="mb-2 font-semibold text-gray-100">{title}</p>
      {children}
    </div>
  );
}

function EntryList({ children }: PropsWithChildren) {
  return <ol className="flex flex-col gap-1 p-0">{children}</ol>;
}

function EntryItem({ entry }: { entry: EntryType }) {
  let { loggedIn } = useLoaderData<typeof loader>();
  return (
    <li className="group mb-5 flex items-center leading-8">
      <p className="mr-2 text-gray-400">{entry.text}</p>
      {loggedIn && (
        <Link
          className="opacity-0 transition-opacity duration-200 hover:text-primary-300 group-hover:opacity-100 "
          to={`/entries/${entry.id}/edit`}
        >
          Edit
        </Link>
      )}
    </li>
  );
}
