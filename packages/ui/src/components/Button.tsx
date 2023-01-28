import { cva, type VariantProps } from "class-variance-authority";
import React, { PropsWithChildren } from "react";
import { cn } from "../utils";

const buttonStyles = cva(
  "focus:ring-4 font-medium rounded-lg text-center focus:outline-none inline-flex items-center",
  {
    variants: {
      intents: {
        primary: [
          "text-white bg-blue-700",
          "hover:bg-blue-800",
          "focus:ring-blue-300",
          "dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800",
        ],
        secondary: [
          "border focus:z-10",
          "text-gray-900 bg-white border-gray-200",
          "hover:bg-gray-100 hover:text-blue-700",
          "focus:ring-gray-200 dark:focus:ring-gray-700",
          "dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700",
        ],
        error: [
          "text-white bg-red-700",
          "hover:bg-red-800",
          "focus:ring-red-300",
          "dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900",
        ],
      },
      size: {
        xs: "px-3 py-2 text-xs",
        sm: "px-3 py-2 text-sm",
        md: "px-5 py-2.5 text-sm",
        lg: "px-5 py-3 text-base",
        xl: "text-base px-6 py-3.5",
      },
    },
    defaultVariants: {
      intents: "primary",
      size: "md",
    },
  }
);
type ButtonProps = JSX.IntrinsicElements["button"] &
  VariantProps<typeof buttonStyles>;

export const Button: React.FC<PropsWithChildren<ButtonProps>> = ({
  size,
  intents,
  children,
  className,
  ...buttonProps
}) => {
  return (
    <button
      className={buttonStyles({
        intents,
        size,
        className: cn(className, buttonProps.disabled && "cursor-not-allowed"),
      })}
      {...buttonProps}
    >
      {children}
    </button>
  );
};
