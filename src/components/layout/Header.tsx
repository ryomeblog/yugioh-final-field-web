import type { ReactNode } from "react";

interface HeaderProps {
  title: string;
  leftAction?: ReactNode;
  actions?: ReactNode;
}

export function Header({ title, leftAction, actions }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-2 bg-gray-800 px-4">
      {leftAction}
      <h1 className="text-lg font-bold text-white">{title}</h1>
      <div className="ml-auto flex items-center gap-2">{actions}</div>
    </header>
  );
}
