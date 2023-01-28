import { cva, VariantProps } from "class-variance-authority";
import React, { forwardRef, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../../utils";

export const inputStyles = cva(
  "block w-full rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500",
  {
    variants: {
      fullWidth: {
        true: "w-full",
      },
      size: {
        lg: "p-4 sm:text-md",
        md: "p-2.5",
        sm: "p-2 sm:text-xs",
      },
      disabled: {
        true: "bg-gray-100 cursor-not-allowed dark:text-gray-400",
      },
      error: {
        true: "bg-red-50 border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);
type InputProps = JSX.IntrinsicElements["input"] &
  VariantProps<typeof inputStyles> & { fullWidth?: boolean };
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, fullWidth, ...props },
  ref
) {
  return (
    <input
      className={inputStyles({
        className,
        fullWidth,
        disabled: props.disabled || props.readOnly,
      })}
      ref={ref}
      {...props}
    />
  );
});

type InputFieldProps = {
  name: string;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  fullWidth?: boolean;
} & VariantProps<typeof inputStyles> &
  React.ComponentProps<typeof Input>;

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField(props, ref) {
    const { name, label, helperText, fullWidth, ...inputProps } = props;
    const { formState, getFieldState } = useFormContext();
    const { error: fieldError } = getFieldState(name, formState);

    return (
      <div>
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
        <Input name={name} ref={ref} error={!!fieldError} {...inputProps} />
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
  }
);
