/**
 * Purpose: Typed layoutId → component map. DashboardScreen resolves the active layout
 *   from here instead of branching inline, so adding a new layout is a two-step change
 *   (new component + one registry entry + a TvLayoutId union member).
 * Inputs: a TvLayoutId (from settings.layout, synced via pc_tv_settings.layout).
 * Outputs: the React component for that layout id.
 * Constraints: every entry must accept exactly DashboardLayoutProps and must NOT render
 *   PrayerTakeover — takeovers stay in DashboardScreen so they layer above all layouts.
 * SPORT: praycalc/tv lib/layouts
 */

import { ComponentType } from 'react';
import ClassicLayout from '../../components/layouts/ClassicLayout';
import FlippedLayout from '../../components/layouts/FlippedLayout';
import StreamFullLayout from '../../components/layouts/StreamFullLayout';
import TimesOnlyLayout from '../../components/layouts/TimesOnlyLayout';
import AmbientLayout from '../../components/layouts/AmbientLayout';
import { TvLayoutId } from '../../types';
import { DashboardLayoutProps } from './types';

export const LAYOUTS: Record<TvLayoutId, ComponentType<DashboardLayoutProps>> = {
  classic: ClassicLayout,
  flipped: FlippedLayout,
  'stream-full': StreamFullLayout,
  'times-only': TimesOnlyLayout,
  ambient: AmbientLayout,
};

/** Resolves the layout component for `id`, falling back to 'classic' when unknown. */
export function getLayoutComponent(id: TvLayoutId): ComponentType<DashboardLayoutProps> {
  return LAYOUTS[id] ?? LAYOUTS.classic;
}
