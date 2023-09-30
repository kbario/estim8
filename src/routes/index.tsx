import { $, QRL, Signal, component$, useComputed$, useSignal, useStore } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

type Thing = {
  name: string;
  enabled: Signal<boolean>;
  hours: Signal<string>;
  min: number
}

type EnclosedThing = {
  name: string;
  data: Thing[];
  // addThing: QRL<(this: EnclosedThing) => void>
}

type BasicProps = {
  data: Thing
}

type MyStore = {
  data: Array<Thing | EnclosedThing>,
  // addThing: QRL<(this: MyStore) => void>
  // addEnclosedThing: QRL<(this: MyStore) => void>
}

const isEnclosedThing = (thing: any): thing is EnclosedThing => Array.isArray(thing?.['data']) && !thing?.['hours']

const arst = (acc: number, idv: Thing | EnclosedThing) => {
  if (isEnclosedThing(idv)) {
    acc += idv.data.reduce(arst, 0)
  } else {
    acc += idv.enabled.value ? parseFloat(idv.hours.value) : 0
  }
  return acc
}

export default component$(() => {

  function addThingToMyStore(this: MyStore) {
    const enabled = useSignal(true)
    const hours = useSignal('1')
    this.data.push(
      {
        enabled,
        hours,
        min: 1,
        name: 'Learning Time/Non-project'
      }
    )
  }

  function addThingToEnclosedThing(this: EnclosedThing) {
    const enabled = useSignal(true)
    const hours = useSignal('1')
    this.data.push({
      enabled,
      hours,
      min: 1,
      name: 'Learning Time/Non-project'
    })
  }

  function addEnclosedThingToMyStore(this: MyStore) {
    const enabled = useSignal(true)
    const hours = useSignal('1')
    this.data.push(
      {
        name: 'Dev Work',
        data: [{
          enabled,
          hours,
          min: 1,
          name: 'Revisions/bug-fixing'
        }],
        // addThing: $(addThingToEnclosedThing)

      }
    )
  }

  // function makeThing()
  // $((x: EnclosedThing) => {
  //
  //   x.data.push({ name: '', hours: useSignal('0'), enabled: useSignal(true), min: 1 })
  // })

  const store = useStore<MyStore>({
    data: [
      {
        enabled: useSignal(true),
        hours: useSignal('1'),
        min: 1,
        name: 'Communications & Meetings'
      },
      {
        enabled: useSignal(true),
        hours: useSignal('1'),
        min: 1,
        name: 'Initial Setup'
      },
      {
        name: 'Dev Work',
        data: [{
          enabled: useSignal(true),
          hours: useSignal('2'),
          min: 1,
          name: 'Revisions/bug-fixing'
        }],
        /* addThing: $(addThingToEnclosedThing) */
      },
      // dev placeholder
      {
        enabled: useSignal(true),
        hours: useSignal('2'),
        min: 1,
        name: 'Revisions/bug-fixing'
      },
      {
        enabled: useSignal(true),
        hours: useSignal('4'),
        min: 1,
        name: 'Unit Tests'
      },
      {
        enabled: useSignal(true),
        hours: useSignal('1'),
        min: 1,
        name: 'Manual Testing'
      },
      {
        enabled: useSignal(true),
        hours: useSignal('0.5'),
        min: 0.5,
        name: 'Merging & Deployments'
      },
      {
        enabled: useSignal(true),
        hours: useSignal('1'),
        min: 0,
        name: 'Learning Time/Non-project'
      }
    ],
    // addThing: $(addThingToMyStore),
    // addEnclosedThing: $(addEnclosedThingToMyStore),
  },
  )

  // useTask$(({ track }) => {
  //   track(() => {
  //     store.enabled
  //   })
  //   console.log(store.init.hours.value)
  // })

  const total = useComputed$(() => {
    return store.data.reduce(arst, 0)
  })

  return <div class="h-screen w-full p-10">
    {store.data.map(x => (isEnclosedThing(x) ?
      (
        <div>
          {x?.name}
          <ul>
            {x?.data.map(y => <li><Basic data={y} /></li>)}
          </ul>
          <button class="btn">add</button>
        </div>
      )
      : <Basic data={x} />))}
    <div>
      {total.value}
    </div>
  </div>;
});


const Basic = component$<BasicProps>((props) => {
  return (
    <div class="flex gap-4 w-fit items-center">
      <div class="form-control w-fit">
        <label class="label cursor-pointer gap-4" >
          <input type="checkbox" bind: checked={props.data.enabled} class="checkbox" />
          <span class="label-text">{props.data.name}</span>
        </label>
      </div>
      <div class="form-control w-fit">
        <label class="label cursor-pointer gap-4" >
          <input type="number" inputMode="numeric" pattern="[0-9]*" min={props.data.min} disabled={!props.data.enabled.value} placeholder="number of hours" class="input input-bordered input-primary w-full max-w-xs" bind: value={props.data.hours} />
        </label>
      </div>
    </div>
  )
})

export const head: DocumentHead = {
  title: "estim8",
  meta: [
    {
      name: "description",
      content: "estim8 like a pro",
    },
  ],
};
