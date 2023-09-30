import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  
  return <div class="h-screen w-full">
    <div class="form-control w-fit">
      <label class="label cursor-pointer gap-4">
        <span class="label-text">Init</span>
        <input type="checkbox" class="checkbox" />
      </label>
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
