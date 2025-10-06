import styles from './Text.module.css';

interface TextProps {
    children: React.ReactNode;
    variant:
        | 'preset1'
        | 'preset2Medium'
        | 'preset2Light'
        | 'preset3'
        | 'preset4'
        | 'preset5'
        | 'mobilePreset1'
        | 'mobilePreset2'
        | 'mobilePreset3'
        | 'mobilePreset4'
        | 'mobilePreset5'
        | 'mobilePreset6';
    id?: string;
    'aria-level'?: number;
    role?: string;
}

export default function Text({
    children,
    variant,
    id,
    'aria-level': ariaLevel,
    role,
}: TextProps) {
    const variantClassName = styles[variant];
    const combinedClassName = `${styles.text} ${variantClassName}`;

    const commonProps = {
        className: combinedClassName,
        id,
        role,
        'aria-level': ariaLevel,
    };

    if (variant === 'preset1' || variant === 'mobilePreset1') {
        return <h1 {...commonProps}>{children}</h1>;
    }

    if (
        variant === 'preset2Medium' ||
        variant === 'preset2Light' ||
        variant === 'mobilePreset2'
    ) {
        return <h2 {...commonProps}>{children}</h2>;
    }

    return <p {...commonProps}>{children}</p>;
}
