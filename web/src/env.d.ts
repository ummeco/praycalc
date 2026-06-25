/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Active UI locale resolved from the NEXT_LOCALE cookie (default 'en'). */
    locale: string;
    /** True when `locale` is a right-to-left language. */
    isRTL: boolean;
  }
}
