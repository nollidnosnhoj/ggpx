import { cva, VariantProps } from "class-variance-authority";
import React, { forwardRef, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../../utils";

const textareaStyles = cva(
  "block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
  {
    variants: {
      size: {
        lg: "p-4 sm:text-md",
        md: "",
        sm: "p-2 sm:text-xs",
      },
      disabled: {
        true: "bg-gray-100 cursor-not-allowed dark:text-gray-400",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);
type TextareaProps = JSX.IntrinsicElements["textarea"] &
  VariantProps<typeof textareaStyles>;
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Input({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        {...props}
        className={textareaStyles({
          className,
          size: props.size,
          disabled: props.disabled,
        })}
      />
    );
  }
);

type TextareaFieldProps = {
  name: string;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  fullWidth?: boolean;
} & VariantProps<typeof textareaStyles> &
  React.ComponentProps<typeof Textarea>;

export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(function InputField(props, ref) {
  const { name, label, helperText, fullWidth, ...inputProps } = props;
  const { formState, getFieldState } = useFormContext();
  const { error: fieldError } = getFieldState(name, formState);

  return (
    <div className="mb-6">
      <label
        className={cn(
          "mb-2 block text-sm font-medium text-gray-900 dark:text-white",
          {
            "text-red-700 dark:text-red-500": !!fieldError,
          }
        )}
      >
        {label}
      </label>
      <Textarea name={name} ref={ref} {...inputProps} />
      {(helperText || fieldError) && (
        <p
          className={cn("mt-2 text-sm text-green-600 dark:text-green-500", {
            "text-red-700 dark:text-red-500": !!fieldError,
          })}
        >
          {fieldError?.message || helperText}
        </p>
      )}
    </div>
  );
});
