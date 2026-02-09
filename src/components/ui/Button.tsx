import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: 'default' | 'primary' | 'danger'
}

export function Button({
    children,
    variant = 'default',
    className = '',
    ...props
}: ButtonProps) {
    const variants = {
        default: 'btn',
        primary: 'btn btn-primary',
        danger: 'btn btn-danger',
    }

    return (
        <button
            className={`${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
