import { buttonVariants } from "@/components/ui/ui/button";
import { cn } from "@/lib/utils";
import {
  faChevronLeft,
  faChevronRight,
  faMapPin,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { DayClickEventHandler, DayPicker } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;
export type CalendarPropsWithEvents = CalendarProps & {
  bookedDays: {
    date: Date;
    title: string;
    link?: string;
  }[];
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  bookedDays,
  ...props
}: CalendarPropsWithEvents) {
  const bookedDaysAsDates = bookedDays.map((day) => day.date.toString());
  const [selectedDay, setSelectedDay] = React.useState<string>(
    new Date().toISOString()
  );

  const handleDayClick: DayClickEventHandler = (day, modifiers) => {
    setSelectedDay(day.toString());
  };

  const footer = React.useMemo(() => {
    if (bookedDaysAsDates.includes(selectedDay)) {
      const bookedDay = bookedDays.find(
        (day) => day.date.toString() === selectedDay
      );
      if (!bookedDay)
        return <div className="mt-2">Nothing scheduled for this day</div>;
      return (
        <a className="mt-2" href={bookedDay.link ?? ""} target="_blank">
          <div
            className="mt-2 flex flex-col items-center justify-center font-medium"
            key={selectedDay}
          >
            <div className="flex items-center gap-1 text-center">
              {bookedDay.title}
              {bookedDay.link && (
                <FontAwesomeIcon
                  className="h-4 w-4 text-purple-500"
                  icon={faMapPin}
                />
              )}
            </div>
          </div>
        </a>
      );
    }

    return <div className="mt-2">Nothing scheduled for this day</div>;
  }, [bookedDays, bookedDaysAsDates, selectedDay]);
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      footer={footer}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <FontAwesomeIcon className="h-4 w-4" icon={faChevronLeft} />
        ),
        IconRight: ({ ...props }) => (
          <FontAwesomeIcon className="h-4 w-4" icon={faChevronRight} />
        ),
      }}
      onDayClick={handleDayClick}
      modifiers={{
        booked: bookedDays.map((day) => day.date),
        booked_range_start: bookedDays
          .filter((day, index) => {
            if (bookedDays[index + 1]?.title === day.title) return true;
          })
          .map((day) => day.date),
        booked_range_end: bookedDays
          .filter((day, index) => {
            if (bookedDays[index - 1]?.title === day.title) return true;
          })
          .map((day) => day.date),
      }}
      modifiersStyles={{
        booked: {
          color: "var(--color-accent-foreground)",
          backgroundColor: "var(--color-accent)",
          border: "2px solid #a855f7",
          outline: "none",
        },
        booked_range_start: {
          color: "var(--color-accent-foreground)",
          backgroundColor: "var(--color-accent)",
          border: "2px solid #a855f7",
          borderRight: "none",
          borderRadius: "4px 0 0 4px",
          outline: "none",
        },
        booked_range_end: {
          color: "var(--color-accent-foreground)",
          backgroundColor: "var(--color-accent)",
          border: "2px solid #a855f7",
          borderLeft: "none",
          borderRadius: "0 4px 4px 0",
          outline: "none",
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
