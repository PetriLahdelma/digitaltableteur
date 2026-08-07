export type LanguageSwitcherOption = {
    code: string;
    label: string;
    ariaLabel: string;
};
export interface LanguageSwitcherProps {
    /** Available languages (code, label, accessible name). */
    languages: LanguageSwitcherOption[];
    /** Currently selected language code. */
    currentLang: string;
    /** Called with the selected language code. */
    onLanguageChange: (code: string) => void;
    /** Optional classes on the group wrapper. */
    className?: string;
    /** Base class override applied to every language button. */
    buttonClassName?: string;
    /** Class override for the current-language trigger. */
    activeButtonClassName?: string;
    /** Class override for the trigger while the tray is open. */
    openTriggerClassName?: string;
    /** Class override for the fanned-out tray options. */
    floatedButtonClassName?: string;
}
export declare function LanguageSwitcher({ languages, currentLang, onLanguageChange, className, buttonClassName, activeButtonClassName, openTriggerClassName, floatedButtonClassName, }: LanguageSwitcherProps): import("react").JSX.Element;
export declare namespace LanguageSwitcher {
    var displayName: string;
}
export default LanguageSwitcher;
//# sourceMappingURL=LanguageSwitcher.d.ts.map