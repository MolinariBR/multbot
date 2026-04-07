import { Search } from 'lucide-react';

interface BotFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterStatus: string;
    onFilterChange: (value: string) => void;
}

export function BotFilters({ searchTerm, onSearchChange, filterStatus, onFilterChange }: BotFiltersProps) {
    return (
        <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, proprietário ou username..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-black/50 border border-violet-500/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="bg-black/50 border border-violet-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                >
                    <option value="all">Todos os Status</option>
                    <option value="active">Ativos</option>
                    <option value="inactive">Inativos</option>
                </select>
            </div>
        </div>
    );
}