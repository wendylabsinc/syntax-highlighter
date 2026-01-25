"use client"

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../utils';
import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';

export interface ComboboxOption {
  value: string;
  label: string;
  group?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  // Group options by their group property
  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, ComboboxOption[]> = {};
    const ungrouped: ComboboxOption[] = [];

    options.forEach((opt) => {
      if (opt.group) {
        if (!groups[opt.group]) {
          groups[opt.group] = [];
        }
        groups[opt.group].push(opt);
      } else {
        ungrouped.push(opt);
      }
    });

    return { groups, ungrouped };
  }, [options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between h-8 text-xs font-normal',
            !selectedOption && 'text-muted-foreground',
            className
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty className="text-xs py-4">{emptyText}</CommandEmpty>
            {groupedOptions.ungrouped.length > 0 && (
              <CommandGroup>
                {groupedOptions.ungrouped.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                    }}
                    className="text-xs"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-3 w-3',
                        value === opt.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {Object.entries(groupedOptions.groups).map(([groupName, groupOpts]) => (
              <CommandGroup key={groupName} heading={groupName}>
                {groupOpts.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                    }}
                    className="text-xs"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-3 w-3',
                        value === opt.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
