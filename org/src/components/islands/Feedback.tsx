// FILE: src/components/islands/Feedback.tsx
// PURPOSE: "Was this page helpful?" feedback widget island.
//   Yes/No buttons; on click, shows a thank-you message via @headlessui/react Transition.
//   Local state only — no network call. Accessible.
// INPUTS: none
// CONSTRAINTS: No next/* imports. React 19. Astro island (client:visible).
// REF: Epic B-2

'use client';

import { useState } from 'react';
import { Transition } from '@headlessui/react';

function CheckIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="10" strokeWidth="0" />
      <path
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="m6.75 10.813 2.438 2.437c1.218-4.469 4.062-6.5 4.062-6.5"
      />
    </svg>
  );
}

export default function Feedback() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <div className="relative h-9">
        {/* Question form */}
        <Transition show={!submitted}>
          <form
            onSubmit={handleSubmit}
            className="absolute inset-0 flex items-center gap-6 transition duration-300 data-[closed]:opacity-0 data-[leave]:pointer-events-none"
          >
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Was this page helpful?
            </p>
            <div className="group grid h-9 grid-cols-[1fr_1px_1fr] overflow-hidden rounded-full border border-zinc-900/10 dark:border-white/10">
              <button
                type="submit"
                name="response"
                value="yes"
                className="px-4 text-sm font-medium text-zinc-600 transition hover:bg-zinc-900/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                Yes
              </button>
              <div className="bg-zinc-900/10 dark:bg-white/10" />
              <button
                type="submit"
                name="response"
                value="no"
                className="px-4 text-sm font-medium text-zinc-600 transition hover:bg-zinc-900/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                No
              </button>
            </div>
          </form>
        </Transition>

        {/* Thank-you message */}
        <Transition show={submitted}>
          <div className="absolute inset-0 flex items-center transition delay-150 duration-300 data-[closed]:opacity-0">
            <div className="flex items-center gap-2.5 rounded-full bg-emerald-50/50 py-1 pr-3 pl-1.5 text-sm text-emerald-900 ring-1 ring-emerald-500/20 ring-inset dark:bg-emerald-500/5 dark:text-emerald-200 dark:ring-emerald-500/30">
              <CheckIcon className="h-5 w-5 flex-none fill-emerald-500 stroke-white dark:fill-emerald-200/20 dark:stroke-emerald-200" />
              Thanks for your feedback!
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
}
