"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { signIn, signOut, useSession } from "next-auth/react";
import SmallLogo from "../../../public/images/SmallLogo.png";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "../ui/ui/menubar";
import { Skeleton } from "../ui/ui/skeleton";
import { Spinner } from "../ui/ui/spinner";

export function NavBar() {
  const shows = api.shows.getAll.useQuery({
    limit: 5,
    orderByStartDate: "desc",
  });
  const session = useSession();

  return (
    <NavigationMenu className="flex w-screen min-w-full justify-between border p-2">
      <div>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <Image src={SmallLogo} alt="Logo" height={30} width={30} />
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
              Shows
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <p className="pb-0 pl-6 pt-2 font-semibold">Recent Shows</p>
              <ul className="grid gap-3 p-6 pt-1 md:w-[400px] lg:w-[500px] lg:grid-cols-[1fr_1fr]">
                {shows.isLoading ? (
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  [...Array(4)].map((_, i) => {
                    return <FakeListItem key={i} />;
                  })
                ) : shows.data ? (
                  shows.data?.map((show) => {
                    return (
                      <ListItem
                        key={show.id}
                        href={`/photos/shows/${show.slug}`}
                        title={show.name}
                      >
                        {show.children && (
                          <div className="flex flex-row items-center gap-2">
                            {show.children.map((child) => (
                              <div key={child.id}>
                                <a
                                  className="text-black underline"
                                  href={`/photos/shows/${show.slug}/${child.slug}`}
                                >
                                  {child.name}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </ListItem>
                    );
                  })
                ) : (
                  <div>No Recent Shows</div>
                )}
              </ul>
              <div className="m-auto mb-2 text-center">
                <Link
                  href="/photos/shows"
                  legacyBehavior
                  passHref
                  className="m-auto"
                >
                  <NavigationMenuLink
                    className={`center ${navigationMenuTriggerStyle()}`}
                  >
                    View All Shows
                  </NavigationMenuLink>
                </Link>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/photos/people" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                People
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </div>
      <div>
        <NavigationMenuList>
          {session.status == "loading" ? (
            <NavigationMenuItem className="text-small border">
              <Spinner className="h-8 w-8 p-1" />
            </NavigationMenuItem>
          ) : session.data?.user ? (
            <>
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger className="cursor-pointer focus:bg-transparent data-[state=open]:bg-transparent">
                    {session.data.user.name}
                  </MenubarTrigger>
                  <MenubarContent className="mr-2">
                    <Link href="/photos/account">
                      <MenubarItem>Account</MenubarItem>
                    </Link>
                    <MenubarSub>
                      <MenubarSubTrigger>My Favorites</MenubarSubTrigger>
                      <MenubarSubContent>
                        <MenubarItem>Riders</MenubarItem>
                        <MenubarItem>Horses</MenubarItem>
                        <MenubarItem>Shows</MenubarItem>
                      </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarItem onClick={() => void signOut()}>
                      Sign Out
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </>
          ) : (
            <NavigationMenuItem>
              <NavigationMenuLink
                className={`cursor-pointer ${navigationMenuTriggerStyle()} `}
                onClick={() => void signIn()}
              >
                Login
              </NavigationMenuLink>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </div>
    </NavigationMenu>
  );
}

const FakeListItem = () => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          )}
        >
          <Skeleton className="h-5 w-10" />
          <Skeleton className="w-15 h-5" />
        </a>
      </NavigationMenuLink>
    </li>
  );
};

const AccountListItem = ({
  className,
  title,
  onClick,
  href,
  ...props
}: {
  className?: string;
  title: string;
  onClick?: () => void;
  href?: string;
}) => {
  return (
    <li>
      <NavigationMenuLink asChild href={href} onClick={onClick}>
        <a
          className={cn(
            "block min-w-[75px] select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
        </a>
      </NavigationMenuLink>
    </li>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
