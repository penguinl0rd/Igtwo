
import React from 'react';

export const PIXEL_ICONS: Record<string, (props?: any) => React.ReactNode> = {
  Family: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 8h2v2H4V8zm4 0h2v2H8V8zm4 0h2v2h-2V8zm4 0h2v2h-2V8zM6 12h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-6 4h2v2H8v-2zm4 0h2v2h-2v-2z" />
    </svg>
  ),
  Cog: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 2h2v4h-2V2zm6.364 1.636l1.414 1.414-2.828 2.828-1.414-1.414 2.828-2.828zM22 11v2h-4v-2h4zM18.778 17.364l-1.414 1.414-2.828-2.828 1.414-1.414 2.828 2.828zM13 22h-2v-4h2v4zM6.636 20.364l-1.414-1.414 2.828-2.828 1.414 1.414-2.828 2.828zM2 13v-2h4v2H2zM5.222 6.636L3.808 5.222l2.828-2.828 1.414 1.414-2.828 2.828zM12 9a3 3 0 100 6 3 3 0 000-6z" />
    </svg>
  ),
  Map: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h2v2H7V7zm8 0h2v2h-2V7zm-4 4h2v2h-2v-2zm-4 4h2v2H7v-2zm8 0h2v2h-2v-2z" />
    </svg>
  ),
  Automation: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2h-2v4H7v2h2v2h2V8h2v2h2V8h2V6h-4V2zM7 12h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" />
    </svg>
  ),
  Report: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h10v2H4v-2zm0 4h10v2H4v-2z" />
    </svg>
  ),
  Penguin: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 2h4v2h-4V2zm-2 2h2v2H8V4zm6 0h2v2h-2V4zm-8 4h12v10H6V8zm4 2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h4v2h-4v-2zm-4 4h12v2H6v-2z" />
    </svg>
  ),
  SnowMan: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 2h4v4h-4V2zm-2 6h8v4H8V8zm-2 6h12v6H6v-6zM9 10h2v2H9v-2zm4 0h2v2h-2v-2z" />
    </svg>
  ),
  Snowflake: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11 2h2v4h-2V2zm0 16h2v4h-2v-4zm8-9h2v2h-2V9zM3 9h2v2H3V9zm11.36 2.64l2.83-2.83 1.41 1.41-2.83 2.83-1.41-1.41zM5.41 5.41l2.83 2.83-1.41 1.41-2.83-2.83 1.41-1.41z" />
    </svg>
  ),
  Moon: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2h2v2h-2V2zm4 2h2v2h-2V4zm2 2h2v2h-2V6zm2 4h2v4h-2v-4zm-2 6h2v2h-2v-2zm-2 2h2v2h-2v-2zm-4 2h2v2h-2v-2zm-4-2h2v2H8v-2zm-2-2h2v2H6v-2zm-2-4h2v4H4v-4zm2-4h2v2H6V6zm2-2h2v2H8V4z" />
    </svg>
  ),
  PineTree: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 2h2v2h-2V2zm-2 4h6v2H9V6zm-2 4h10v2H7v-2zm-2 4h14v2H5v-2zm6 4h2v4h-2v-4z" />
    </svg>
  ),
  Present: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 8h16v12H4V8zm7-4h2v4h-2V4zm-5 0h2v4H6V4zm8 0h2v4h-2V4zm-10 6h16v2H4v-2zm7 2v8h2v-8h-2z" />
    </svg>
  ),
  Igloo: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 12h16v8H4v-8zm2-4h12v4H6V8zm4-4h4v4h-4V4zM9 16h2v4H9v-4z" />
    </svg>
  )
};

export const PROFILE_ICONS = ['Penguin', 'SnowMan', 'Snowflake', 'Moon', 'PineTree', 'Present'];

export const COLOR_PALETTES = [
  { name: 'Midnight', primary: '#312e81', secondary: '#1e1b4b', accent: '#818cf8' },
  { name: 'Cozy Fire', primary: '#7c2d12', secondary: '#431407', accent: '#fb923c' },
  { name: 'Evergreen', primary: '#064e3b', secondary: '#022c22', accent: '#34d399' },
  { name: 'Frost', primary: '#0c4a6e', secondary: '#082f49', accent: '#38bdf8' },
];
