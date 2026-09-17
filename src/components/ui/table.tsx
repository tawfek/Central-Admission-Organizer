import * as React from "react"
import { cn } from "@/lib/utils"

export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return <div className="relative w-full overflow-auto"><table className={cn("w-full caption-bottom text-sm", className)} {...props} /></div>
}
export function TableHeader({ className, ...props }: React.ComponentProps<"thead">) { return <thead className={cn("[&_tr]:border-b", className)} {...props} /> }
export function TableBody({ className, ...props }: React.ComponentProps<"tbody">) { return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} /> }
export function TableRow({ className, ...props }: React.ComponentProps<"tr">) { return <tr className={cn("border-b border-zinc-100 transition-colors hover:bg-zinc-50 data-[state=selected]:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60 dark:data-[state=selected]:bg-zinc-800", className)} {...props} /> }
export function TableHead({ className, ...props }: React.ComponentProps<"th">) { return <th className={cn("h-11 px-3 text-start align-middle text-xs font-semibold text-zinc-500 sm:px-4 dark:text-zinc-400", className)} {...props} /> }
export function TableCell({ className, ...props }: React.ComponentProps<"td">) { return <td className={cn("p-3 align-middle sm:p-4", className)} {...props} /> }
