import * as React from 'react';
import { Input } from './input';
import { cn } from '~/lib/utils';

export interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value' | 'type'
> {
  value: number | string;
  onChange: (value: number) => void;
  allowDecimal?: boolean;
  maxDecimals?: number;
}

/**
 * NumberInput - A formatted number input that displays commas but stores pure numeric values
 *
 * Features:
 * - Displays numbers with comma separators (e.g., 1,000.50)
 * - Stores and returns pure numeric values (e.g., 1000.50)
 * - Handles decimal numbers
 * - Prevents invalid input
 *
 * Usage:
 * <NumberInput
 *   value={price}
 *   onChange={(val) => setPrice(val)}
 *   placeholder="0.00"
 * />
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onChange, allowDecimal = true, maxDecimals = 2, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');

    // Format number with commas
    const formatNumber = (num: number | string): string => {
      if (num === '' || num === null || num === undefined) return '';

      const numStr = String(num);
      const parts = numStr.split('.');
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      if (parts.length > 1 && allowDecimal) {
        return `${integerPart}.${parts[1]}`;
      }

      return integerPart;
    };

    // Remove commas and parse to number
    const parseNumber = (str: string): number => {
      const cleaned = str.replace(/,/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Update display value when prop value changes
    React.useEffect(() => {
      if (value === '' || value === null || value === undefined) {
        setDisplayValue('');
      } else {
        setDisplayValue(formatNumber(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Allow empty input
      if (inputValue === '') {
        setDisplayValue('');
        onChange(0);
        return;
      }

      // Remove existing commas for validation
      const cleanedValue = inputValue.replace(/,/g, '');

      // Validate input
      const decimalRegex = allowDecimal ? new RegExp(`^\\d*\\.?\\d{0,${maxDecimals}}$`) : /^\d*$/;

      if (decimalRegex.test(cleanedValue)) {
        // Update display with formatted value
        setDisplayValue(formatNumber(cleanedValue));

        // Send numeric value to parent
        const numericValue = parseNumber(cleanedValue);
        onChange(numericValue);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Clean up trailing decimal point on blur
      if (displayValue.endsWith('.')) {
        const cleaned = displayValue.slice(0, -1);
        setDisplayValue(formatNumber(cleaned));
      }

      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(className)}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';
