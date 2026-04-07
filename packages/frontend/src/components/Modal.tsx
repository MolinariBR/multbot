import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useModalKeyboard } from './useModalKeyboard';
import { useModalScrollLock } from './useModalScrollLock';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon?: ReactNode;
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function Modal({
    isOpen,
    onClose,
    title,
    icon,
    children,
    maxWidth = 'md'
}: ModalProps) {
    useModalKeyboard(isOpen, onClose);
    useModalScrollLock(isOpen);

    if (!isOpen) return null;

    const maxWidthClassMap = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div
                className={`
                    bg-gradient-to-br from-zinc-900 to-black rounded-2xl
                    border border-violet-500/20 w-full max-h-[90vh]
                    overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200
                    ${maxWidthClassMap[maxWidth]}
                `}
                role="dialog"
                aria-modal="true"
            >
                <div className="sticky top-0 bg-gradient-to-br from-zinc-900 to-black border-b border-violet-500/20 p-6 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                                {icon}
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-white">{title}</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-gray-400 hover:text-white"
                        aria-label="Fechar"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
