import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';


export function CustomSelect({ data = [], skeleton, nooptntext, noselecttext, className, multiselect, required, onSelect, error, label, helpertext, loader, ...props }) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState('')
    const [values, setValues] = React.useState([])
    const handleSelect = (currentValue) => {

        setOpen(false)
        if (multiselect) {
            if (!values.includes(currentValue))
                setValues((prev) => ([...prev, currentValue]))
            else
                setValues(values.filter(item => item !== currentValue))
        } else {
            setValue(currentValue === value ? "" : currentValue)
        }
    }
    useEffect(() => {
        multiselect ? onSelect(values) : onSelect(value)
    }, [value, values, onSelect, multiselect])

    const labelClassName = `block text-xs leading-6 ${error ? "text-red-500" : "text-foreground/60"}`;

    if (skeleton)
        return <div className={cn('mt-6 h-10 animate-pulse border-0 bg-muted rounded', className)} />;

    
    return (
        <div className="">
            {label && (
                <label className={labelClassName}>
                    {label}
                    {required && "*"}
                </label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(`w-[200px] justify-between px-2 ${error ? "text-red-500 border-red-500 hover:text-red-400" : "text-foreground"} `, className)}
                    >
                        <div className="overflow-hidden">
                            {data.length === 0 ? nooptntext : (
                                multiselect ? (
                                    <MultipleSelected values={values} noselecttext={noselecttext} />
                                ) : (
                                    data.find(item => item.value === value)?.label || noselecttext
                                )
                            )}

                        </div>
                        <div className=" py-2 pl-2">
                            {loader ? <Spinner /> : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                        </div>

                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder={data.length === 0 ? nooptntext : "Search..."} />
                        <CommandList>
                            <CommandEmpty>{nooptntext}</CommandEmpty>
                            <CommandGroup>
                                {
                                    (data.map((item) => (
                                        <CommandItem
                                            key={item.value}
                                            value={item.value}
                                            onSelect={handleSelect}
                                            selected={multiselect ? values.includes(item.value) : value === item.value}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    multiselect ? values.includes(item.value) ? "opacity-100" : "opacity-0" : value === item.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {item.label}
                                        </CommandItem>
                                    )))
                                }
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {helpertext && <label className={labelClassName}>{helpertext}</label>}
        </div>
    )
}

const MultipleSelected = ({ values, noselecttext }) => {
    return (
        <div className="flex gap-1">
            {values.length ? (
                values.map((value) => <span key={value} className="px-1 bg-foreground/20 rounded">{value}</span>)
            ) : (
                noselecttext
            )}
        </div>
    );
};

function Spinner() {
    return (
        <svg role="status" class="inline h-4 w-4 animate-spin mr-2 text-gray-200 dark:text-gray-600 fill-gray-700"
            viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor" />
            <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill" />
        </svg>
    )
}