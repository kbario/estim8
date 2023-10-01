import { component$, useComputed$, useStore } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

type Thing = {
  name: string;
  enabled: boolean;
  hours: string;
  min: number;
};

type EnclosedThing = {
  name: string;
  data: Thing[];
};

type BasicProps = {
  data: Thing;
};

type MyStore = Array<Thing | EnclosedThing>;

const isEnclosedThing = (thing: any): thing is EnclosedThing =>
  Array.isArray(thing?.["data"]) && !thing?.["hours"];

const arst = (acc: number, idv: Thing | EnclosedThing) => {
  if (isEnclosedThing(idv)) {
    acc += idv.data.reduce(arst, 0);
  } else {
    acc += idv.enabled ? parseFloat(idv.hours) || 0 : 0;
  }
  return acc;
};

function makeThing(name: string, hours: number, min: number = 1) {
  return {
    enabled: true,
    hours: hours.toString(),
    min: min,
    name,
  };
}
function makeEnclosedThing(
  name: string,
  data: { name: string; hours: number; min?: number },
) {
  return {
    name,
    data: [makeThing(data.name, data.hours, data.min || 1)],
  };
}

export default component$(() => {
  const store = useStore<MyStore>([
    makeThing("Communications & Meetings", 1),
    makeThing("Initial Setup", 1),
    makeEnclosedThing("Dev Work", { name: "asdf", hours: 2 }),
    makeThing("Revisions/bug-fixing", 2),
    makeThing("Unit Tests", 4),
    makeThing("Manual Testing", 1),
    makeThing("Merging & Deployments", 0.5),
    makeThing("Learning Time/Non-project", 1, 0),
  ]);

  const total = useComputed$(() => {
    return store.reduce(arst, 0);
  });

  return (
    <div class="h-screen w-full p-10">
      {store.map((x, idx) =>
        isEnclosedThing(x) ? (
          <div class="" key={idx}>
            {x?.name}
            <ul>
              {x?.data.map((y, id) => (
                <li class="flex items-center gap-4" key={id}>
                  <Basic data={y} />

                  <button
                    class="btn btn-error btn-outline"
                    onClick$={() => x.data.splice(id, 1)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      class="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
            <button
              class="btn"
              onClick$={() =>
                x.data.push(makeThing(Math.random().toString(), 1))
              }
            >
              add
            </button>
          </div>
        ) : (
          <Basic key={idx} data={x} />
        ),
      )}
      <div>{total.value}</div>
    </div>
  );
});

const Basic = component$<BasicProps>((props) => {
  return (
    <div class="flex w-fit items-center gap-4">
      <div class="form-control w-fit">
        <label class="label cursor-pointer gap-4">
          <input
            type="checkbox"
            checked={props.data.enabled}
            onChange$={(_, el) => (props.data.enabled = el.checked)}
            class="checkbox"
          />
          <span class="label-text">{props.data.name}</span>
        </label>
      </div>
      <div class="form-control w-fit">
        <label class="label cursor-pointer gap-4">
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={props.data.min}
            disabled={!props.data.enabled}
            placeholder="number of hours"
            class="input input-bordered input-primary w-full max-w-xs"
            value={props.data.hours}
            onInput$={(_, el) => (props.data.hours = el.value)}
          />
        </label>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "estim8",
  meta: [
    {
      name: "description",
      content: "estim8 like a pro",
    },
  ],
};
