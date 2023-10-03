import {
  Signal,
  component$,
  useComputed$,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  useLocation,
  type DocumentHead,
  useNavigate,
} from "@builder.io/qwik-city";

type Thing = {
  name: string;
  enabled: boolean;
  hours: string;
  min: number;
};

type ThingS = {
  name: string;
  enabled: Signal<boolean>;
  hours: Signal<string>;
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
type CopyBtnProps = {
  store: MyStore;
  total: Signal<number>;
  totalTotal: Signal<number>;
  confidence: Signal<string>;
  enabled: Signal<boolean>;
};

const SEARCH_PARAM_NAME = "D";

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

const getPlurality = (a: string) => (a === "1" ? "hr" : "hrs");

const zxcd = (init: string) => (acc: string, idv: Thing | EnclosedThing) => {
  if (isEnclosedThing(idv)) {
    acc += `${init}- ${idv.name}: \n`;
    acc += idv.data.reduce(zxcd(init + "  "), "");
  } else {
    acc += idv.enabled
      ? `${init}- ${idv.name}: ${idv.hours}${getPlurality(idv.hours)} \n`
      : "";
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
  data?: { name: string; hours: number; min?: number },
) {
  return {
    name,
    data: data?.name ? [makeThing(data.name, data.hours, data.min || 1)] : [],
  };
}

export default component$(() => {
  const loc = useLocation();
  const nav = useNavigate();

  const store = useStore<MyStore>([
    makeThing("Communications & Meetings", 1),
    makeThing("Initial Setup", 1),
    makeEnclosedThing("Dev Work"),
    makeThing("Revisions/bug-fixing", 2),
    makeThing("Writing Tests", 4),
    makeThing("Manual Testing", 1),
    makeThing("Merging & Deployments", 0.5),
    makeThing("Learning Time/Non-project", 1, 0),
  ]);

  useVisibleTask$(async ({ track }) => {
    track(() => loc.url)
    const a = loc.url.searchParams.get(SEARCH_PARAM_NAME);
    if (!a) return;
    const b: MyStore = JSON.parse(decodeURIComponent(`${a}`));
    b.forEach((v) => {
      const d = store.find((x) => x.name === v.name);
      if (isEnclosedThing(d)) {
        //@ts-ignore
        d.data = v.data;
      } else {
        //@ts-ignore
        d.hours = v.hours;
        //@ts-ignore
        d.enabled = v.enabled;
      }
    });
    await nav("/");
  });

  const confidenceFactorS = useSignal<string>("1.1");
  const confidenceFactorEnabledS = useSignal<boolean>(true);

  const total = useComputed$(() => {
    return store.reduce(arst, 0);
  });

  const totalTotal = useComputed$(() => {
    return confidenceFactorEnabledS.value && confidenceFactorS.value
      ? Math.ceil(store.reduce(arst, 0) * parseFloat(confidenceFactorS.value))
      : store.reduce(arst, 0);
  });

  return (
    <div class="flex min-h-viewi w-full max-w-[800px]  flex-col justify-center gap-1 px-10 py-2">
      {store.map((x, idx) =>
        isEnclosedThing(x) ? (
          <OuterBasic key={`o-${idx}`} thing={x} />
        ) : (
          <Basic key={`a-${idx}`} data={x} />
        ),
      )}
      <div class="p-2"></div>
      <BasicSignal
        data={{
          name: "Confidence Level",
          hours: confidenceFactorS,
          enabled: confidenceFactorEnabledS,
          min: 1,
        }}
      />
      <div class="sticky bottom-0 flex items-center justify-between bg-base-100 py-4">
        <div class=" flex flex-col">
          <span class="">total</span>
          <span class="text-2xl">
            {confidenceFactorEnabledS.value && confidenceFactorS.value && (
              <span>
                {total.value} * {confidenceFactorS.value} ={" "}
              </span>
            )}
            <span class="text-2xl font-bold ">
              {totalTotal.value} {getPlurality(totalTotal.value.toString())}
            </span>
          </span>
        </div>
        <CopyButton
          store={store}
          totalTotal={totalTotal}
          total={total}
          confidence={confidenceFactorS}
          enabled={confidenceFactorEnabledS}
        />
      </div>
    </div>
  );
});

const XBtn = component$<{ thing: EnclosedThing; id: number }>((props) => {
  return (
    <button
      class="btn btn-error btn-outline"
      onClick$={() => props.thing.data.splice(props.id, 1)}
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
  );
});

const enterFn =
  (
    name: Signal<string>,
    hours: Signal<string>,
    thing: EnclosedThing,
    dialogRef: Signal<HTMLDialogElement | undefined>,
  ) =>
    (event: KeyboardEvent) => {
      if (event.isComposing || !(event.keyCode === 13)) {
        return;
      }
      fn(name, hours, thing, dialogRef);
    };

const fn = (
  name: Signal<string>,
  hours: Signal<string>,
  thing: EnclosedThing,
  dialogRef: Signal<HTMLDialogElement | undefined>,
) => {
  if (!name.value || !hours.value) return;
  thing.data.push(makeThing(name.value, parseFloat(hours.value)));
  name.value = "";
  hours.value = "1";
  dialogRef.value?.close();
};

const OuterBasic = component$<{ thing: EnclosedThing }>((props) => {
  const dialogRef = useSignal<HTMLDialogElement>();
  const name = useSignal("");
  const hours = useSignal("1");
  return (
    <div class="flex flex-col gap-1">
      {props.thing.name}
      <ul class="flex flex-col gap-1">
        {props.thing.data.map((y, id) => (
          <li class="flex w-full items-center gap-1" key={`i-${id}`}>
            <Basic data={y} />
            <XBtn thing={props.thing} id={id} />
          </li>
        ))}
      </ul>
      <button
        class="btn self-start"
        onClick$={() => {
          dialogRef.value?.showModal();
          addEventListener(
            "keyup",
            enterFn(name, hours, props.thing, dialogRef),
          );
        }}
      >
        Add
      </button>
      <dialog ref={dialogRef} id="my_modal_1" class="modal">
        <div class="modal-box">
          <h3 class="text-lg font-bold">Add to {props.thing.name}</h3>
          <div class="mt-6 flex flex-wrap items-center gap-2">
            <TextInput val={name} />
            <NumberInputSignal val={hours} increment={1} />
          </div>
          <div class="modal-action">
            <button
              class="btn btn-secondary btn-outline"
              onClick$={() => dialogRef.value?.close()}
            >
              Close
            </button>
            <button
              class="btn btn-primary"
              onClick$={() => {
                fn(name, hours, props.thing, dialogRef);
                removeEventListener(
                  "keyup",
                  enterFn(name, hours, props.thing, dialogRef),
                );
              }}
            >
              Add
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
});

const Basic = component$<BasicProps>((props) => {
  return (
    <div class="flex w-full flex-wrap items-center gap-x-4">
      <div class="form-control min-w-[150px] grow">
        <CheckBox data={props.data} />
      </div>
      <div class="form-control w-fit">
        <NumberInput data={props.data} />
      </div>
    </div>
  );
});

const BasicSignal = component$<{ data: ThingS }>((props) => {
  return (
    <div class="flex w-full flex-wrap items-center gap-x-4">
      <div class="form-control min-w-[150px] grow">
        <CheckBoxSignal data={props.data} />
      </div>
      <div class="form-control w-fit">
        <NumberInputSignal val={props.data.hours} increment={0.1} />
      </div>
    </div>
  );
});

const CheckBoxSignal = component$<{ data: ThingS }>((props) => {
  return (
    <label class="label w-full min-w-[48px] cursor-pointer justify-start gap-x-4">
      <input
        type="checkbox"
        class="checkbox"
        bind: checked={props.data.enabled}
      />
      <span class="label-text w-full max-w-xs">{props.data.name}</span>
    </label>
  );
});

const CheckBox = component$<BasicProps>((props) => {
  return (
    <label class="label w-full min-w-[48px] cursor-pointer justify-start gap-x-4">
      <input
        type="checkbox"
        checked={props.data.enabled}
        onChange$={(_, el) => (props.data.enabled = el.checked)}
        class="checkbox"
      />
      <span class="label-text w-full max-w-xs">{props.data.name}</span>
    </label>
  );
});

const NumberInput = component$<BasicProps>((props) => {
  return (
    <input
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      min={props.data.min}
      disabled={!props.data.enabled}
      placeholder="number of hours"
      class="input input-bordered input-primary w-28 max-w-xs"
      value={props.data.hours}
      onInput$={(_, el) => (props.data.hours = el.value)}
    />
  );
});

const NumberInputSignal = component$<{
  val: Signal<string>;
  increment: number;
}>((props) => {
  return (
    <input
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      min={1}
      step={props.increment}
      placeholder="number of hours"
      class="input input-bordered input-primary w-28  max-w-xs"
      bind: value={props.val}
    />
  );
});

const TextInput = component$<{ val: Signal<string> }>((props) => {
  return (
    <input
      type="text"
      placeholder="name of thing"
      class="input input-bordered input-primary w-full max-w-xs cursor-pointer"
      bind: value={props.val}
    />
  );
});

const CopyButton = component$<CopyBtnProps>((props) => {
  return (
    <button
      class="btn"
      onClick$={() => {
        const qwer =
          props.enabled.value && props.confidence.value
            ? `\ntotal: ${props.total.value} * ${props.confidence.value} = **${props.totalTotal.value
              }${getPlurality(props.totalTotal.value.toString())}**`.toString()
            : `\ntotal: **${props.total.value}${getPlurality(
              props.total.value.toString(),
            )}**`.toString();
        const jkl = `\n\n[Re-estim8 here](https://estim8.kbar.io/?${SEARCH_PARAM_NAME}=${encodeURIComponent(
          JSON.stringify(props.store),
        )})`;
        const zxcv = props.store.reduce(zxcd(""), "") + qwer + jkl;
        navigator.clipboard.writeText(zxcv);
      }}
    >
      {" "}
      Copy
    </button>
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
