import { buttonVariants } from "@/components/ui/ui/button";
import { cn } from "@/lib/utils";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { set } from "date-fns";
import * as React from "react";
import { DayClickEventHandler, DayPicker } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;
export type CalendarPropsWithEvents = CalendarProps & {
  bookedDays: {
    date: Date;
    title: string;
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
    console.log(day);
    setSelectedDay(day.toString());
  };

  const footer = React.useMemo(() => {
    console.log(selectedDay);
    console.log(bookedDaysAsDates);
    console.log(bookedDaysAsDates.includes(selectedDay));
    if (bookedDaysAsDates.includes(selectedDay)) {
      return (
        <div className="flex flex-col items-center justify-center">
          <p className="text-center">
            {
              bookedDays.find((day) => day.date.toString() === selectedDay)
                ?.title
            }
          </p>
        </div>
      );
    }

    return <div>Nothing scheduled for this day</div>;
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
      modifiers={{ booked: bookedDays.map((day) => day.date) }}
      modifiersStyles={{
        booked: {
          color: "var(--color-accent-foreground)",
          backgroundColor: "var(--color-accent)",
          border: "2px solid #a855f7",
          outline: "none",
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
