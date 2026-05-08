import React from 'react'

interface IconProps {
  size?: number
  color?: string
  strokeWidth?: number
}

const svg = (size: number, color: string, sw: number, children: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

export const Home = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>)

export const User = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>)

export const Users = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>)

export const Shield = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></>)

export const Folder = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />)

export const BookOpen = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>)

export const UserPlus = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></>)

export const Download = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>)

export const Code = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>)

export const Dashboard = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>)

export const LogOut = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>)

export const Menu = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>)

export const ChevronLeft = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <polyline points="15 18 9 12 15 6" />)

export const ChevronRight = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <polyline points="9 18 15 12 9 6" />)

export const ChevronDown = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <polyline points="6 9 12 15 18 9" />)

export const Check = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <polyline points="20 6 9 17 4 12" />)

export const Plus = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>)

export const Edit = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>)

export const Trash = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>)

export const ArrowRight = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>)

export const Star = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />)

export const Lock = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>)

export const ShieldCheck = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></>)

export const Image = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>)

export const Globe = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>)

export const AlertTriangle = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>)

export const Book = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>)

export const Upload = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>)

export const CircleDot = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></>)

export const RefreshCw = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></>)

export const Grid = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>)

export const List = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>)

export const Maximize = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></>)

export const Play = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <polygon points="5 3 19 12 5 21 5 3" />)

export const ExternalLink = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>)

export const File = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></>)

export const Search = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>)

export const Clock = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>)

export const Zap = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />)

export const Layout = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></>)

export const Eye = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>)

export const EyeOff = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><line x1="1" y1="1" x2="23" y2="23" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="14.12" y1="14.12" x2="22" y2="22" /></>)

export const FileText = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>)

export const Layers = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>)

export const Sparkles = ({ size = 18, color = 'currentColor', strokeWidth = 1.8 }: IconProps) =>
  svg(size, color, strokeWidth, <><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></>)
