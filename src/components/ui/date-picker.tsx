import { useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  label: string;
  value: string;          // ISO date string "YYYY-MM-DD" or ""
  onChange: (value: string) => void;
}

export function DatePicker({ label, value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const date = value && isValid(parseISO(value)) ? parseISO(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 w-full justify-start gap-2 text-xs font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon size={12} className="shrink-0" />
          <span className="truncate">{date ? format(date, "MMM d, yyyy") : label}</span>
          {date && (
            <X
              size={11}
              className="ml-auto shrink-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d: Date | undefined) => { onChange(d ? format(d, "yyyy-MM-dd") : ""); setOpen(false); }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
