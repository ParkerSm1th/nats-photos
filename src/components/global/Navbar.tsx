"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { Show } from "@/common/types";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn, isAdmin } from "@/lib/utils";
import { api } from "@/utils/api";
import {
  ClerkLoading,
  SignOutButton,
  SignedIn,
  SignedOut,
  useUser,
} from "@clerk/nextjs";
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
import { useCart } from "@/providers/CartProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/pro-regular-svg-icons";
import { CartIcon } from "./CartIcon";

export function NavBar() {
  const shows = api.shows.getAll.useQuery(
    {
      limit: 5,
      orderByStartDate: "desc",
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );
  const { user } = useUser();
  const { cart } = useCart();

  return (
    <>
      <NavigationMenu className="flex w-screen min-w-full justify-between border p-2">
        <div>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/photos" legacyBehavior passHref>
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
                    shows.data?.map((show: Show) => {
                      return (
                        <Link
                          href={`/photos/shows/${show.slug}`}
                          key={show.id}
                          passHref
                          legacyBehavior
                        >
                          <ListItem title={show.name}>
                            {show.children && (
                              <div className="flex flex-row items-center gap-2">
                                {show.children.map((child: Show) => (
                                  <div key={child.id}>
                                    <Link
                                      href={`/photos/shows/${show.slug}/${child.slug}`}
                                      className="text-black underline"
                                    >
                                      {child.name}
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            )}
                          </ListItem>
                        </Link>
                      );
                    })
                  ) : (
                    <div>No Recent Shows</div>
                  )}
                </ul>
                <div className="m-auto mb-2 text-center">
                  <Link
                    href="/photos/"
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
              <Link
                href={"/photos/people"}
                legacyBehavior
                passHref
                className={navigationMenuTriggerStyle()}
              >
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  People
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </div>
        <div>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link
                href={"/photos/cart"}
                legacyBehavior
                passHref
                className={navigationMenuTriggerStyle()}
              >
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <CartIcon size={cart.length} />
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <SignedIn>
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger className="flex cursor-pointer flex-row justify-center gap-2 align-middle focus:bg-transparent data-[state=open]:bg-transparent">
                    {user?.imageUrl && (
                      <Image
                        src={user?.imageUrl}
                        height={20}
                        width={20}
                        style={{
                          borderRadius: "100%",
                        }}
                        alt="Your PFP"
                      />
                    )}
                    Your Account
                  </MenubarTrigger>
                  <MenubarContent className="mr-2">
                    <Link href="/photos/account/purchases">
                      <MenubarItem>Purchases</MenubarItem>
                    </Link>
                    <Link
                      href={
                        process.env.NODE_ENV == "development"
                          ? "https://big-sloth-75.accounts.dev/user"
                          : "https://accounts.natalielockhartphotos.com/user"
                      }
                    >
                      <MenubarItem>Security</MenubarItem>
                    </Link>
                    {/* <MenubarSub>
                      <MenubarSubTrigger>My Favorites</MenubarSubTrigger>
                      <MenubarSubContent>
                        <MenubarItem>Riders</MenubarItem>
                        <MenubarItem>Horses</MenubarItem>
                        <MenubarItem>Shows</MenubarItem>
                      </MenubarSubContent>
                    </MenubarSub> */}
                    <MenubarSeparator />
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                    {user?.publicMetadata && isAdmin(user.publicMetadata) && (
                      <>
                        <MenubarSub>
                          <MenubarSubTrigger>Admin</MenubarSubTrigger>
                          <MenubarSubContent>
                            <Link href="/photos/admin/shows">
                              <MenubarItem>Shows</MenubarItem>
                            </Link>
                          </MenubarSubContent>
                        </MenubarSub>
                        <MenubarSeparator />
                      </>
                    )}
                    <SignOutButton>
                      <MenubarItem>Sign Out</MenubarItem>
                    </SignOutButton>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </SignedIn>
            <SignedOut>
              <NavigationMenuLink
                className={`cursor-pointer ${navigationMenuTriggerStyle()} `}
                href={"/sign-in"}
              >
                Login
              </NavigationMenuLink>
            </SignedOut>
            <ClerkLoading>
              <NavigationMenuLink
                className={`cursor-pointer ${navigationMenuTriggerStyle()} `}
              >
                <Spinner className="h-8 w-8 p-1" />
              </NavigationMenuLink>
            </ClerkLoading>
          </NavigationMenuList>
        </div>
      </NavigationMenu>
    </>
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
