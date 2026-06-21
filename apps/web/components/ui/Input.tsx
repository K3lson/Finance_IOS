import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  prefix?: string
  suffix?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, suffix, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-text-muted text-sm pointer-events-none select-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full bg-surface-elevated border rounded-xl text-text-primary placeholder:text-text-muted text-sm transition-all duration-150 outline-none',
              'focus:border-brand focus:ring-2 focus:ring-brand/20',
              error ? 'border-danger' : 'border-surface-border',
              prefix ? 'pl-8' : 'pl-4',
              suffix ? 'pr-8' : 'pr-4',
              'py-3',
              className,
            ].join(' ')}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-text-muted text-sm pointer-events-none select-none">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p className="text-danger text-xs mt-0.5">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
