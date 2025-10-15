import { useState, useRef, useEffect } from 'react';
import styles from './Dropdown.module.css';

interface DropdownOption {
    value: string;
    label: string;
}

interface DropdownProps {
    options: DropdownOption[];
    value?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    id?: string;
    'aria-label'?: string;
}

export default function Dropdown({
    options,
    value,
    placeholder = "Select an option",
    onChange,
    disabled = false,
    id,
    'aria-label': ariaLabel,
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(option => option.value === value);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handleOptionClick = (optionValue: string) => {
        onChange?.(optionValue);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, []);

    return (
        <div className={styles.dropdown} ref={dropdownRef}>
            <button
                id={id}
                type="button"
                className={`${styles.dropdownButton} ${disabled ? styles.disabled : ''}`}
                onClick={toggleDropdown}
                disabled={disabled}
                aria-label={ariaLabel}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className={styles.dropdownText}>{displayText}</span>
                <img
                    src={isOpen ? '/assets/icon-arrow-up.png' : '/assets/icon-arrow-down.png'}
                    alt={isOpen ? 'Collapse' : 'Expand'}
                    className={styles.dropdownIcon}
                />
            </button>

            {isOpen && (
                <ul 
                    className={styles.dropdownMenu}
                    role="listbox"
                    aria-label={ariaLabel || "Dropdown options"}
                >
                    {options.map((option) => (
                        <li key={option.value}>
                            <button
                                type="button"
                                className={`${styles.dropdownOption} ${
                                    option.value === value ? styles.selected : ''
                                }`}
                                onClick={() => handleOptionClick(option.value)}
                                role="option"
                                aria-selected={option.value === value}
                            >
                                {option.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
