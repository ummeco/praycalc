/**
 * MDX component overrides — server-safe only.
 * Client components (Heading, Code, Feedback) are intentionally excluded here
 * to keep this module free of any client directives.
 * Tainted MDX pages cannot export metadata (Next.js server-only).
 * Pages that need interactive components must import them directly.
 */

import clsx from 'clsx'

import { Prose } from '@/components/Prose'

// Use a plain anchor — next/link is 'use client' which taints all MDX pages that
// import useMDXComponents. MDX docs don't need client-side prefetching.
export function a({
  href,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'a'>) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  )
}

export function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <article className="flex h-full flex-col pt-16 pb-10">
      <Prose className="flex-auto">{children}</Prose>
    </article>
  )
}

export const h2 = function H2({
  children,
  id,
  ...props
}: React.ComponentPropsWithoutRef<'h2'>) {
  return (
    <h2 id={id} {...props}>
      {id ? (
        <a href={`#${id}`} className="not-prose group relative">
          {children}
        </a>
      ) : (
        children
      )}
    </h2>
  )
}

// Server-safe code rendering — no syntax highlighting or tabs
export const code = function Code({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'code'>) {
  return (
    <code className={clsx(className, 'font-mono text-sm')} {...props}>
      {children}
    </code>
  )
}

export const pre = function Pre({
  children,
  ...props
}: React.ComponentPropsWithoutRef<'pre'>) {
  return (
    <pre
      className="overflow-x-auto rounded-2xl bg-zinc-900 p-4 text-sm text-zinc-100"
      {...props}
    >
      {children}
    </pre>
  )
}

export function CodeGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-6 overflow-hidden rounded-2xl bg-zinc-900 shadow-md">
      {children}
    </div>
  )
}

export function Button({
  href,
  children,
  variant = 'primary',
}: {
  href?: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'filled' | 'outline' | 'text'
}) {
  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full px-4 py-2 bg-emerald-400/10 text-emerald-400 ring-1 ring-inset ring-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-300 hover:ring-emerald-300"
      >
        {children}
      </Link>
    )
  }
  return (
    <button
      type="button"
      className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full px-4 py-2 bg-emerald-400/10 text-emerald-400 ring-1 ring-inset ring-emerald-400/20"
    >
      {children}
    </button>
  )
}

function InfoIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" {...props}>
      <circle cx="8" cy="8" r="8" strokeWidth="0" />
      <path
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M6.75 7.75h1.5v3.5"
      />
      <circle cx="8" cy="4" r=".5" fill="none" />
    </svg>
  )
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 flex gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 p-4 text-sm/6 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/5 dark:text-emerald-200 dark:[--tw-prose-links-hover:var(--color-emerald-300)] dark:[--tw-prose-links:var(--color-white)]">
      <InfoIcon className="mt-1 h-4 w-4 flex-none fill-emerald-500 stroke-white dark:fill-emerald-200/20 dark:stroke-emerald-200" />
      <div className="*:first:mt-0 *:last:mb-0">{children}</div>
    </div>
  )
}

export function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 items-start gap-x-16 gap-y-10 xl:max-w-none xl:grid-cols-2">
      {children}
    </div>
  )
}

export function Col({
  children,
  sticky = false,
}: {
  children: React.ReactNode
  sticky?: boolean
}) {
  return (
    <div
      className={clsx(
        '*:first:mt-0 *:last:mb-0',
        sticky && 'xl:sticky xl:top-24',
      )}
    >
      {children}
    </div>
  )
}

export function Properties({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6">
      <ul
        role="list"
        className="m-0 max-w-[calc(var(--container-lg)-(--spacing(8)))] list-none divide-y divide-zinc-900/5 p-0 dark:divide-white/5"
      >
        {children}
      </ul>
    </div>
  )
}

export function Property({
  name,
  children,
  type,
}: {
  name: string
  children: React.ReactNode
  type?: string
}) {
  return (
    <li className="m-0 px-0 py-4 first:pt-0 last:pb-0">
      <dl className="m-0 flex flex-wrap items-center gap-x-3 gap-y-2">
        <dt className="sr-only">Name</dt>
        <dd>
          <code>{name}</code>
        </dd>
        {type && (
          <>
            <dt className="sr-only">Type</dt>
            <dd className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
              {type}
            </dd>
          </>
        )}
        <dt className="sr-only">Description</dt>
        <dd className="w-full flex-none *:first:mt-0 *:last:mb-0">
          {children}
        </dd>
      </dl>
    </li>
  )
}
