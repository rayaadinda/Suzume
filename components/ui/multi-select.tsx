"use client"

import * as React from "react"
import { Check, X, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface MultiSelectOption {
	label: string
	value: string
	color?: string
}

interface MultiSelectProps {
	options: MultiSelectOption[]
	selected: string[]
	onChange: (values: string[]) => void
	placeholder?: string
	className?: string
}

export function MultiSelect({
	options,
	selected,
	onChange,
	placeholder = "Select items...",
	className,
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false)

	const handleSelect = (value: string) => {
		if (selected.includes(value)) {
			onChange(selected.filter((item) => item !== value))
		} else {
			onChange([...selected, value])
		}
	}

	const handleRemove = (value: string, e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		onChange(selected.filter((item) => item !== value))
	}

	const selectedOptions = options.filter((option) =>
		selected.includes(option.value)
	)

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn(
						"w-full justify-between min-h-9 h-auto",
						className
					)}
				>
					<div className="flex flex-wrap gap-1 flex-1">
						{selectedOptions.length > 0 ? (
							selectedOptions.map((option) => (
								<Badge
									key={option.value}
									variant="secondary"
									className="mr-1 gap-1"
									style={
										option.color
											? {
													backgroundColor: `${option.color}20`,
													color: option.color,
													borderColor: `${option.color}40`,
											  }
											: undefined
									}
								>
									{option.label}
									<button
										className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												handleRemove(option.value, e as any)
											}
										}}
										onMouseDown={(e) => handleRemove(option.value, e)}
										onClick={(e) => handleRemove(option.value, e)}
									>
										<X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
									</button>
								</Badge>
							))
						) : (
							<span className="text-muted-foreground">{placeholder}</span>
						)}
					</div>
					<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0" align="start">
				<Command>
					<CommandInput placeholder="Search..." />
					<CommandList>
						<CommandEmpty>No items found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									value={option.value}
									onSelect={() => handleSelect(option.value)}
								>
									<div className="flex items-center gap-2 flex-1">
										{option.color && (
											<div
												className="h-3 w-3 rounded-full"
												style={{ backgroundColor: option.color }}
											/>
										)}
										<span>{option.label}</span>
									</div>
									<Check
										className={cn(
											"ml-auto h-4 w-4",
											selected.includes(option.value)
												? "opacity-100"
												: "opacity-0"
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
