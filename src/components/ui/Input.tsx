import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
}

export function Input({ label, className = '', id, ...props }: InputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-xs uppercase tracking-wider text-ink-light font-medium"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`
          w-full px-3 py-2 
          bg-transparent 
          border border-ink 
          text-ink text-sm
          placeholder:text-ink-light
          focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-0
          ${className}
        `}
                {...props}
            />
        </div>
    )
}
