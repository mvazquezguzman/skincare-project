"use client"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DiaryEntry } from "@/lib/diary-types"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useMemo } from "react"
import * as React from "react"

interface DiaryCalendarProps {
  entries: DiaryEntry[]
  selectedDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void
  currentMonth: Date
  onMonthChange: (date: Date) => void
}

function getRatingColor(rating: number): string {
  if (rating >= 4) return "bg-green-500" // Good (4-5)
  if (rating === 3) return "bg-yellow-500" // Average (3)
  if (rating === 2) return "bg-orange-500" // Below Avg (2)
  return "bg-red-500" // Poor (1)
}

export function DiaryCalendar({
  entries,
  selectedDate,
  onDateSelect,
  currentMonth,
  onMonthChange,
}: DiaryCalendarProps) {
  const entriesByDate = useMemo(() => {
    const map = new Map<string, DiaryEntry>()
    entries.forEach((entry) => {
      map.set(entry.entry_date, entry)
    })
    return map
  }, [entries])

  // Custom Day component
  const DayComponent = React.useCallback((props: any) => {
    // react-day-picker v9 passes 'day' object with 'date' property, or 'date' directly
    const date = props.day?.date || props.date
    const { displayMonth, className, onClick, ...buttonProps } = props
    
    if (!date) {
      return <></>
    }
    
    // Check if this is an outside day by checking className or comparing dates
    const isOutsideDay = className?.includes('day-outside') || 
      (displayMonth && (date.getMonth() !== displayMonth.getMonth() || date.getFullYear() !== displayMonth.getFullYear()))
    
    // For outside days, return empty fragment (they should be hidden by CSS)
    if (isOutsideDay) {
      return <></>
    }
    
    const dateStr = format(date, "yyyy-MM-dd")
    const entry = entriesByDate.get(dateStr)
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e)
      }
      onDateSelect(date)
    }
    
    // Render the default day button with our custom overlay
    return (
      <div className="relative inline-block h-9 w-9">
        <button
          {...buttonProps}
          type="button"
          className={cn(
            className,
            "relative h-9 w-9 p-0 font-normal rounded-md",
            "hover:bg-accent hover:text-accent-foreground",
            "focus:bg-accent focus:text-accent-foreground"
          )}
          onClick={handleClick}
        >
          {format(date, "d")}
        </button>
        {entry && (
          <span
            className={cn(
              "absolute bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full pointer-events-none z-10",
              getRatingColor(entry.skin_condition_rating)
            )}
            title={`Rating: ${entry.skin_condition_rating}/5`}
          />
        )}
      </div>
    )
  }, [entriesByDate, onDateSelect])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-montserrat text-lg">Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <style dangerouslySetInnerHTML={{__html: `
          .rdp-table { margin-top: 0 !important; }
          .rdp-head_row { margin-bottom: 0 !important; }
          .rdp-row:first-of-type { margin-top: 0 !important; }
        `}} />
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          month={currentMonth}
          onMonthChange={onMonthChange}
          className="w-full"
          showOutsideDays={false}
          fixedWeeks={false}
          components={{
            Day: DayComponent,
          }}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-2",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse",
            head_row: "flex w-full mb-0",
            head_cell: "text-muted-foreground w-9 h-9 font-normal text-[0.8rem] flex items-center justify-center flex-shrink-0 p-0 m-0",
            row: "flex w-full mt-1",
            cell: "h-9 w-9 flex items-center justify-center text-sm p-0 m-0 relative flex-shrink-0 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 [&:has(.day-outside)]:!hidden [&:empty]:!hidden",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "hidden",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
        />
        {/* Legend */}
        <div className="mt-6 pt-4 border-t flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground font-open-sans">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span>Good (4-5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            <span>Average (3)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <span>Below Avg (2)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>Poor (1)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

