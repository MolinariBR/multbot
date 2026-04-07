import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    pageSize?: number;
}

const calculateVisibleItems = (currentPage: number, pageSize: number, totalItems: number) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  return { startItem, endItem };
};

const generatePageButtons = (currentPage: number, totalPages: number, onPageChange: (page: number) => void) => {
  const buttons = [];

  if (currentPage > 3) {
    buttons.push(
      <button
        key="first"
        onClick={() => onPageChange(1)}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400"
      >
        1
      </button>,
      <span key="dots1" className="text-gray-600">...</span>
    );
  }

  buttons.push(
    <span
      key="current"
      className="w-8 h-8 flex items-center justify-center bg-violet-600 text-white rounded-lg font-medium"
    >
      {currentPage}
    </span>
  );

  if (currentPage < totalPages - 2) {
    buttons.push(
      <span key="dots2" className="text-gray-600">...</span>,
      <button
        key="last"
        onClick={() => onPageChange(totalPages)}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400"
      >
        {totalPages}
      </button>
    );
  }

  return buttons;
};

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
    pageSize = 20
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const { startItem, endItem } = calculateVisibleItems(currentPage, pageSize, totalItems);

    return (
        <div className="border-t border-violet-500/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
                Mostrando <span className="font-medium text-white">{startItem}</span> a <span className="font-medium text-white">{endItem}</span> de <span className="font-medium text-white">{totalItems}</span> resultados
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`
                        px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20
                        border border-violet-500/30 rounded-lg text-violet-400
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors flex items-center gap-1
                    `}
                >
                    <ChevronLeft size={16} />
                    Anterior
                </button>

                <div className="flex items-center gap-1 px-2">
                    {generatePageButtons(currentPage, totalPages, onPageChange)}
                </div>

                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`
                        px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20
                        border border-violet-500/30 rounded-lg text-violet-400
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors flex items-center gap-1
                    `}
                >
                    Próxima
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
