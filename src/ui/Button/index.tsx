import styles from './Button.module.css';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit';
    className?: 'primary' | 'secondary';
    id?: string;
    'aria-label'?: string;
}

export default function Button({
    children,
    onClick,
    disabled = false,
    type = 'button',
    className = 'primary',
    id,
    'aria-label': ariaLabel,
}: ButtonProps) {
    return (
        <button
            id={id}
            type={type}
            className={`${styles.button} ${styles[className]}`}
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
        >
            {children}
        </button>
    );
}
