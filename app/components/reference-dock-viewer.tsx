'use client'
import React, { useState } from "react";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DocItem {
    pageContent?: string;
    metadata: {
        source?: string;
        loc?: { pageNumber?: number };
    };
}

interface ReferenceViewerProps {
    documents: DocItem[];
}

const ReferenceViewer: React.FC<ReferenceViewerProps> = ({ documents }) => {
    if (!documents?.length) return null;

    // Group documents by unique source
    const groupedDocs = documents.reduce((acc, doc) => {
        const src = doc.metadata?.source;
        if (src) {
            if (!acc[src]) acc[src] = [];
            acc[src].push(doc);
        }
        return acc;
    }, {} as Record<string, DocItem[]>);

    // Clean filename (remove timestamp prefixes)
    const getCleanFileName = (source: string) => {
        const raw = source.split("/").pop() || "file.pdf";
        // Remove numeric/timestamp-like prefixes (e.g. "1757...-1464...-")
        return raw.replace(/^[\d-]+/, "").replace(/^-+/, "");
    };

    // Download handler (API)
    const handleDownload = async (source: string) => {
        try {
            const res = await fetch(
                `http://localhost:8000/download?file=${encodeURIComponent(source)}`
            );
            if (!res.ok) throw new Error("Failed to fetch file");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = getCleanFileName(source);
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download error:", err);
        }
    };

    // Persisted expand state for page previews (keyed by source + pageNumber)
    const [expandedPages, setExpandedPages] = useState<Set<string>>(() => new Set());

    const toggleExpand = (key: string) => {
        setExpandedPages((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    return (
        <div className="w-full p-3 rounded-xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm">
            <h2 className="text-base font-semibold mb-3">📑 References</h2>

            <Accordion type="multiple" className="w-full space-y-1">
                {Object.entries(groupedDocs).map(([src, docs], idx) => {
                    const cleanName = getCleanFileName(src);
                    return (
                        <AccordionItem
                            key={src}
                            value={`pdf-${idx}`}
                            className="border rounded-md"
                        >
                            <AccordionTrigger className="text-sm px-2 py-1">
                                <div className="flex items-center justify-between w-full">
                                    <span className="truncate">
                                        {cleanName} ({docs.length} pages)
                                    </span>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                        onClick={(e) => {
                                            e.stopPropagation(); // don't toggle accordion when clicking download
                                            handleDownload(src);
                                        }}
                                    >
                                        <Download className="w-3 h-3 mr-1" />
                                        PDF
                                    </Button>
                                </div>
                            </AccordionTrigger>

                            <AccordionContent className="px-2 py-1">
                                <Accordion type="multiple" className="space-y-1">
                                    {docs.map((doc, pageIdx) => {
                                        const pageNum = doc.metadata?.loc?.pageNumber ?? pageIdx + 1;
                                        const pageKey = `${src}::page_${pageNum}`;

                                        // preview logic
                                        const lines = doc.pageContent?.split("\n") ?? [];
                                        const preview = lines.slice(0, 4).join("\n");
                                        const isExpanded = expandedPages.has(pageKey);

                                        return (
                                            <AccordionItem
                                                key={pageKey}
                                                value={`pdf-${idx}-page-${pageIdx}`}
                                                className="border rounded-sm"
                                            >
                                                <AccordionTrigger className="text-xs px-2 py-1">
                                                    Page {pageNum}
                                                </AccordionTrigger>

                                                <AccordionContent className="px-1 py-1">
                                                    <div className="text-xs text-gray-700 whitespace-pre-wrap px-2 py-1 rounded-lg border border-slate-100 bg-slate-50/60">
                                                        {isExpanded ? doc.pageContent : preview}
                                                        {lines.length > 4 && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // don't collapse the accordion when toggling
                                                                    toggleExpand(pageKey);
                                                                }}
                                                                className="ml-2 text-blue-600 text-[11px] underline"
                                                            >
                                                                {isExpanded ? "Show less" : "Show more"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
};

export default ReferenceViewer;
