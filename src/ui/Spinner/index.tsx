import styles from './Spinner.module.css';

interface SpinnerProps {
    size?: 'small' | 'medium' | 'large';
    color?: 'white' | 'red' | 'blue';
    fullscreen?: boolean;
    inline?: boolean;
    children?: React.ReactNode;
    className?: string;
    'aria-label'?: string;
}

export default function Spinner({
    size = 'medium',
    color = 'red',
    fullscreen = false,
    inline = false,
    children,
    className,
    'aria-label': ariaLabel = 'Loading...',
}: SpinnerProps) {
    const containerClass = fullscreen 
        ? `${styles.container} ${styles.fullscreen}` 
        : inline 
        ? styles.inline 
        : styles.container;

    const spinnerElement = (
        <div
            className={`${styles.spinner} ${styles[size]} ${styles[color]} ${className || ''}`}
            role="status"
            aria-label={ariaLabel}
        />
    );

    if (children) {
        return (
            <div className={containerClass}>
                {spinnerElement}
                {children}
            </div>
        );
    }

    if (fullscreen || !inline) {
        return (
            <div className={containerClass}>
                {spinnerElement}
            </div>
        );
    }

    return spinnerElement;
}