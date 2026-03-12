import { useState, useEffect } from 'react';
import { Download, Save, ChevronLeft, Layout, FileText, RefreshCw, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BookDesigner() {
    const navigate = useNavigate();
    const [chapters, setChapters] = useState<string[]>([]);
    const [selectedChapter, setSelectedChapter] = useState('');
    const [markdown, setMarkdown] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Fetch chapters list on mount
    useEffect(() => {
        fetch('/api/cms/chapters')
            .then(res => res.json())
            .then(data => {
                if (data.chapters) setChapters(data.chapters);
            })
            .catch(err => console.error("Failed to fetch chapters", err));
    }, []);

    // Clean up ObjectObjectURL on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // Fetch specific chapter when selected
    useEffect(() => {
        if (!selectedChapter) {
            setMarkdown('');
            setPreviewUrl(null);
            return;
        }
        setIsLoading(true);
        fetch(`/api/cms/chapters/${selectedChapter}`)
            .then(res => res.json())
            .then(data => {
                setMarkdown(data.content || '');
                setPreviewUrl(null); // Clear previous preview on chapter switch
            })
            .catch(err => console.error("Failed to read chapter", err))
            .finally(() => setIsLoading(false));
    }, [selectedChapter]);

    const handleGeneratePreview = async () => {
        if (!markdown) return;
        setIsPreviewing(true);
        try {
            const res = await fetch('/api/cms/preview-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markdown })
            });
            if (!res.ok) throw new Error('API Error');

            const blob = await res.blob();
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });
            const url = URL.createObjectURL(pdfBlob);
            setPreviewUrl(url);
        } catch (error) {
            console.error(error);
            alert("Failed to generate PDF preview.");
        } finally {
            setIsPreviewing(false);
        }
    };

    const handleSave = async () => {
        if (!selectedChapter) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/cms/chapters/${selectedChapter}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markdown })
            });
            const data = await res.json();
            if (data.success) {
                alert(`✅ Saved ${selectedChapter}`);
            } else {
                alert('Error saving: ' + data.error);
            }
        } catch (e) {
            alert('Save failed.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-gray-200 p-8 pt-20 flex flex-col">
            <div className="max-w-screen-2xl mx-auto w-full flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6 shrink-0">
                    <div>
                        <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-500 hover:text-[#00d0ff] transition-colors text-sm mb-4">
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-serif text-white flex items-center gap-3">
                            <Layout className="w-8 h-8 text-[#00d0ff]" />
                            Live Paginator CMS
                        </h1>
                        <p className="text-gray-500 mt-2 text-[10px] uppercase tracking-[0.2em] font-medium">Authoring & Pagination Visualizer</p>
                    </div>

                    <div className="flex gap-4 items-center bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                        <div className="flex flex-col">
                            <label className="text-[10px] uppercase tracking-widest text-[#00d0ff] mb-2 font-semibold">Active Document</label>
                            <select
                                value={selectedChapter}
                                onChange={(e) => setSelectedChapter(e.target.value)}
                                className="bg-black border border-gray-700/50 rounded px-4 py-2 text-sm focus:border-[#00d0ff] focus:outline-none text-gray-300 w-64 appearance-none"
                            >
                                <option value="">-- Select Chapter --</option>
                                {chapters.map(ch => (
                                    <option key={ch} value={ch}>{ch}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={!selectedChapter || isSaving || isLoading}
                            className="bg-[#00d0ff]/10 text-[#00d0ff] border border-[#00d0ff]/30 px-6 py-2 rounded flex items-center gap-2 hover:bg-[#00d0ff] hover:text-black transition-all ml-4 disabled:opacity-50 disabled:cursor-not-allowed h-[38px] mt-[18px]"
                        >
                            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSaving ? 'Saving...' : 'Save to Disk'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-8 min-h-0">
                    {/* Editor Sidebar */}
                    <div className="flex flex-col border border-gray-800 rounded-lg overflow-hidden bg-black/40 shadow-xl">
                        <div className="bg-gray-900 border-b border-gray-800 p-3 flex justify-between items-center shrink-0">
                            <span className="text-xs uppercase tracking-widest text-[#00d0ff] font-semibold flex items-center gap-2">
                                Markdown Source
                                {isLoading && <RefreshCw className="w-3 h-3 animate-spin text-gray-500" />}
                            </span>
                        </div>
                        <textarea
                            value={markdown}
                            disabled={isLoading}
                            onChange={(e) => setMarkdown(e.target.value)}
                            className="flex-1 w-full bg-transparent p-6 text-gray-300 font-mono text-sm leading-relaxed focus:outline-none resize-none custom-scrollbar"
                            spellCheck="false"
                            placeholder={selectedChapter ? "Type here..." : "Select a chapter to begin editing..."}
                        />
                    </div>

                    {/* True PDF Preview */}
                    <div className="flex flex-col border border-[#00d0ff]/20 rounded-lg overflow-hidden bg-black shadow-2xl relative">
                        <div className="bg-gray-900 border-b border-gray-800 p-3 flex justify-between items-center shrink-0 relative z-10">
                            <span className="text-xs uppercase tracking-widest text-[#00d0ff] font-semibold flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                True PDF Export Preview
                            </span>
                            <button
                                onClick={handleGeneratePreview}
                                disabled={!markdown || isPreviewing}
                                className="bg-[#00d0ff] text-black px-4 py-1.5 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 hover:bg-white transition-all disabled:opacity-50"
                            >
                                {isPreviewing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                                {isPreviewing ? 'Rendering...' : 'Generate Live PDF'}
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden bg-[#222] relative flex items-center justify-center">
                            {previewUrl ? (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-full border-none"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="text-center text-gray-600 flex flex-col items-center">
                                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="text-sm font-mono">Click "Generate Live PDF" to instantly render your changes.</p>
                                    <p className="text-xs mt-2 opacity-50">Uses the exact print engine. 100% fidelity.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
