import type { ReactNode } from "react";

interface ListCardProps {
  children: ReactNode;
  className?: string;
}

export default function ListCard({
  children,
  className = "",
}: ListCardProps) {
  const classes = [
    "my-3 block w-full rounded-lg border border-gray-300 bg-white p-4 text-black transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lg",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
