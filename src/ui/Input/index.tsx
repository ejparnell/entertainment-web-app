import styles from './Input.module.css';

interface InputProps {
    placeholder?: string;
    value: string;
    onChange: (newValue: string) => void;
    id?: string;
    label?: string;
    'aria-label'?: string;
    showError?: boolean;
    errorMessage?: string;
    required?: boolean;
    type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';
    disabled?: boolean;
}

export default function Input({
    placeholder = 'Enter text',
    value,
    onChange,
    id = 'input-field',
    label,
    'aria-label': ariaLabel,
    showError = false,
    errorMessage = "Can't be empty",
    required = false,
    type = 'text',
    disabled = false,
}: InputProps) {
    const hasError = showError && value.trim() === '';

    const labelText = label || ariaLabel || 'Input field';
    const useVisibleLabel = Boolean(label);
    
    return (
        <div className={styles.inputContainer}>
            {useVisibleLabel ? (
                <label htmlFor={id} className={styles.label}>
                    {labelText}
                    {required && <span className={styles.required} aria-label="required">*</span>}
                </label>
            ) : (
                <label htmlFor={id} className={styles.visuallyHidden}>
                    {labelText}
                    {required && ' (required)'}
                </label>
            )}
            <input
                id={id}
                type={type}
                className={`${styles.textInput} ${hasError ? styles.error : ''} ${disabled ? styles.disabled : ''}`}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${id}-error` : undefined}
                aria-required={required}
                autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'off'}
                spellCheck={false}
                disabled={disabled}
                required={required}
            />
            {hasError && (
                <span 
                    id={`${id}-error`}
                    className={styles.errorMessage}
                    role="alert"
                    aria-live="polite"
                >
                    {errorMessage}
                </span>
            )}
        </div>
    );
}