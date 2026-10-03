import { useState, type InputHTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'

type InputSize = 'sm' | 'md' | 'lg'

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  hint?: string
  size?: InputSize
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-sm',
}

export default function Input({
  id,
  label,
  error,
  hint,
  size = 'md',
  required,
  disabled,
  className = '',
  ...props
}: InputProps) {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = props.type === 'password'
  const inputType = isPassword && showPassword ? 'text' : props.type

  const describedBy = error
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {label}

          {required && (
            <span
              aria-hidden="true"
              className="mr-1 text-danger"
            >
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <input
          {...props}
          type={inputType}
          id={id}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={[
          'block w-full rounded-md border bg-surface text-foreground',
          'placeholder:text-muted-foreground',
          'transition',
          'focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isPassword ? 'pe-10' : '',
          error
            ? 'border-danger focus:border-danger focus:ring-danger/20'
            : 'border-input',
          sizeClasses[size],
          className,
        ].join(' ')}
        />

        {isPassword && (
          <button
            type="button"
            aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
            title={showPassword ? t('common.hidePassword') : t('common.showPassword')}
            onClick={() => setShowPassword((visible) => !visible)}
            disabled={disabled}
            className="absolute inset-y-0 end-0 inline-flex w-10 items-center justify-center text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs text-danger"
        >
          {error}
        </p>
      )}

      {!error && hint && (
        <p
          id={`${id}-hint`}
          className="mt-1.5 text-xs text-muted-foreground"
        >
          {hint}
        </p>
      )}
    </div>
  )
}
