import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { faCalendar } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/ui/form";
import { Input } from "../ui/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/ui/popoverDialog";
import { toast } from "../ui/ui/use-toast";

const CreateSchema = z.object({
  name: z.string({
    required_error: "A show name is required.",
  }),
  location: z.string({
    required_error: "A location is required.",
  }),
  dates: z.object({
    from: z.date({
      required_error: "A start date is required.",
    }),
    to: z.date({
      required_error: "An end date is required.",
    }),
  }),
});

export const NewShowDialog = ({
  className,
  open,
  onClose,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  onClose: () => void;
}) => {
  const form = useForm<z.infer<typeof CreateSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    resolver: zodResolver(CreateSchema),
  });

  const createShow = api.shows.create.useMutation();
  const utils = api.useContext();

  async function onSubmit(data: z.infer<typeof CreateSchema>) {
    await createShow.mutateAsync({
      name: data.name,
      location: data.location,
      startDate: data.dates.from.toISOString(),
      endDate: data.dates.to.toISOString(),
    });
    await utils.shows.getAll.invalidate();
    onClose();
    form.reset({
      name: "",
      location: "",
      dates: {
        from: undefined,
        to: undefined,
      },
    });
    toast({
      title: "Show created successfully!",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onClose();
        if (!open) {
          form.reset({
            name: "",
            location: "",
            dates: {
              from: undefined,
              to: undefined,
            },
          });
          onClose();
        }
      }}
    >
      <DialogContent className={`sm:max-w-[625px] ${className}`}>
        <DialogHeader>
          <DialogTitle>New Show</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Show Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Halloween Show" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Fox Hill Equestrian" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dates"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Show Dates</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "LLL dd, y")} -{" "}
                                {format(field.value.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(field.value.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <FontAwesomeIcon
                            icon={faCalendar}
                            className="ml-auto h-4 w-4 opacity-50"
                          />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        bookedDays={[]}
                        initialFocus
                        mode="range"
                        defaultMonth={field.value?.from}
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Create Show</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
