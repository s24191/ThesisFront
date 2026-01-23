import {useEffect, useState} from "react";
import { fetchWines, type WineFilters  } from "../features/wines/api";
import type {Wine} from "../features/wines/types";
import { WineList } from "../features/wines/components/WineList";
import { WineFiltersBar } from "@/features/wines/components/WineFiltersBar";

export const WinesPage: React.FC = () => {
    const [wines, setWines] = useState<Wine[]>([]);
    const [filters, setFilters] = useState<WineFilters>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const loadWines = async (f: WineFilters) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await fetchWines(f);
            setWines(data);
        } catch (e: any) {
            setError(e.message ?? "Failed to load wines");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadWines({
            ...filters,
            page,
            pageSize,
        });
    }, [filters, page, pageSize]);


    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-semibold mb-4">Wines</h1>

            <WineFiltersBar onChange={(f) => {
                setPage(1);        // reset page when filters change
                setFilters(f);
            }}/>

            {/* page size + pager */}
            <div className="mt-4 mb-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <span>Wines per page:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPage(1);
                            setPageSize(Number(e.target.value));
                        }}
                        className="border rounded px-2 py-1 text-sm"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm">Page {page}</span>
                    <button
                        disabled={!wines.length}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {error && <p className="text-red-500 mt-2">{error}</p>}
            {isLoading ? <p className="mt-4">Loading…</p> : <WineList wines={wines}/>}
        </div>
    );
}
