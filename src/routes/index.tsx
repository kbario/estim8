import { component$, useComputed$, useSignal, useStore, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {

  const store = useStore({
    init: {
      enabled: useSignal(true),
      hours: useSignal('1'),
      min: 1,
    }
  })

  useTask$(({ track }) => {
    track(() => {
      store.init.enabled
    })
    console.log(store.init.hours.value)
  })

  const total = useComputed$(() => {
    return (store.init.enabled.value ? parseInt(store.init.hours.value) : 0)
  })

  return <div class="h-screen w-full p-10">
    <div class="flex gap-4 w-fit items-center">
      <div class="form-control w-fit">
        <label class="label cursor-pointer gap-4" >
          <input type="checkbox" bind: checked={store.init.enabled} class="checkbox" />
          <span class="label-text">Init</span>
        </label>
      </div>
      <div class="form-control w-fit">
        <label class="label cursor-pointer gap-4" >
          <input type="number" min={store.init.min} disabled={!store.init.enabled.value} placeholder="number of hours" class="input input-bordered input-primary w-full max-w-xs" bind: value={store.init.hours} />
        </label>
      </div>
    </div>

    <div>
      {total.value}
    </div>
  </div>;
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
