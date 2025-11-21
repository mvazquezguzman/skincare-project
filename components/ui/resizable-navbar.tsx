"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Navbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-primary border-b border-primary",
        className
      )}
      {...props}
    />
  );
});
Navbar.displayName = "Navbar";

const NavBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 items-center justify-between h-20",
        className
      )}
      {...props}
    />
  );
});
NavBody.displayName = "NavBody";

const NavItems = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    items?: Array<{ name: string; link: string }>;
  }
>(({ className, items, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center space-x-6", className)}
      {...props}
    />
  );
});
NavItems.displayName = "NavItems";

const NavbarLogo = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center", className)}
      {...props}
    />
  );
});
NavbarLogo.displayName = "NavbarLogo";

const NavbarButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary";
  }
>(({ className, variant = "primary", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variant === "primary"
          ? "bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2",
        className
      )}
      {...props}
    />
  );
});
NavbarButton.displayName = "NavbarButton";

const MobileNav = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("md:hidden", className)}
      {...props}
    />
  );
});
MobileNav.displayName = "MobileNav";

const MobileNavHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between h-20 px-4 sm:px-6",
        className
      )}
      {...props}
    />
  );
});
MobileNavHeader.displayName = "MobileNavHeader";

const MobileNavToggle = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isOpen?: boolean;
  }
>(({ className, isOpen, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center w-10 h-10 space-y-1.5 text-primary-foreground",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "block w-6 h-0.5 bg-current transition-all duration-300",
          isOpen && "rotate-45 translate-y-2"
        )}
      />
      <span
        className={cn(
          "block w-6 h-0.5 bg-current transition-all duration-300",
          isOpen && "opacity-0"
        )}
      />
      <span
        className={cn(
          "block w-6 h-0.5 bg-current transition-all duration-300",
          isOpen && "-rotate-45 -translate-y-2"
        )}
      />
    </button>
  );
});
MobileNavToggle.displayName = "MobileNavToggle";

const MobileNavMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isOpen?: boolean;
    onClose?: () => void;
  }
>(({ className, isOpen, onClose, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "fixed inset-x-0 top-20 bg-primary border-b border-primary transition-all duration-300 ease-in-out overflow-hidden",
        isOpen
          ? "max-h-[calc(100vh-5rem)] opacity-100 visible"
          : "max-h-0 opacity-0 invisible",
        className
      )}
      {...props}
    />
  );
});
MobileNavMenu.displayName = "MobileNavMenu";

export {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
};
