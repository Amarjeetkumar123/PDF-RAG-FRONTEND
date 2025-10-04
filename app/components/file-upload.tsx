'use client'
import React, { useState, useEffect } from 'react'
import { Upload, FileText, Loader2, X } from 'lucide-react'
import { useToastContext } from '../contexts/toast-context'

interface UploadedFile {
    file: File
    uploading: boolean
    path?: string
}

interface SavedFile {
    name: string
    size: number
    lastModified: number
    uploading: boolean
    path?: string
}

const FileUploadComponent: React.FC = () => {
    const [files, setFiles] = useState<UploadedFile[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const { toast } = useToastContext()

    // Load files from localStorage on component mount
    useEffect(() => {
        const savedFiles = localStorage.getItem('uploadedFiles')
        if (savedFiles) {
            try {
                const parsedFiles: SavedFile[] = JSON.parse(savedFiles)
                const restoredFiles: UploadedFile[] = parsedFiles.map(savedFile => ({
                    file: new File([], savedFile.name, {
                        lastModified: savedFile.lastModified,
                    }),
                    uploading: false, // Assume all saved files are already uploaded
                    path: savedFile.path,
                }))
                setFiles(restoredFiles)
            } catch (error) {
                console.error('Error parsing saved files:', error)
            }
        }
    }, [])

    // Save files to localStorage whenever files change
    useEffect(() => {
        if (files.length > 0) {
            const filesToSave: SavedFile[] = files.map(file => ({
                name: file.file.name,
                size: file.file.size,
                lastModified: file.file.lastModified,
                uploading: file.uploading,
                path: file.path,
            }))
            localStorage.setItem('uploadedFiles', JSON.stringify(filesToSave))
        } else {
            localStorage.removeItem('uploadedFiles')
        }
    }, [files])

    const handleFiles = async (selectedFiles: FileList | null) => {
        if (!selectedFiles) return
        const fileArray = Array.from(selectedFiles)

        const newFiles: UploadedFile[] = fileArray.map((file) => ({
            file,
            uploading: true,
        }))

        setFiles((prev) => [...prev, ...newFiles])

        for (const file of fileArray) {
            const formData = new FormData()
            formData.append('pdf', file)

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/upload/pdf`, {
                    method: 'POST',
                    body: formData,
                })
                const data = await response.json()
                console.log(data)
                
                if (response.ok) {
                    // mark as uploaded
                    setFiles((prev) =>
                        prev.map((f) =>
                            f.file.name === file.name ? { ...f, uploading: false, path: data?.filePath || '' } : f
                        )
                    )
                    toast.success('Upload successful', `${file.name} has been uploaded successfully`)
                } else {
                    throw new Error(data.message || 'Upload failed')
                }
            } catch (err) {
                console.error('Upload error:', err)
                // Remove file from state if upload fails
                setFiles((prev) =>
                    prev.filter((f) => f.file.name !== file.name)
                )
                toast.error('Upload failed', `Failed to upload ${file.name}. Please try again.`)
            }
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
    }

    const handleBrowse = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/pdf'
        input.multiple = true
        input.onchange = (e) => handleFiles((e.target as HTMLInputElement).files)
        input.click()
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const clearAllFiles = () => {
        setFiles([])
        localStorage.removeItem('uploadedFiles')
    }

    return (
        <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                className={`flex flex-col gap-3 flex-1 p-2 rounded-lg transition ${isDragging ? 'bg-slate-100 border-2 border-dashed border-slate-400' : ''
                    }`}
            >
            {/* Upload Box */}
            <div
                onClick={handleBrowse}
                className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 hover:bg-slate-50 transition-colors px-4 py-10 text-center cursor-pointer"
            >
                <Upload className="h-5 w-5 mb-1 text-slate-700" />
                <span className="text-sm font-medium text-slate-800">Upload or Drag PDF</span>
                <p className="mt-3 text-xs text-slate-500">PDF only • multiple files supported</p>
            </div>

            {/* Clear All Button */}
            {files.length > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={clearAllFiles}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    >
                        Clear All
                    </button>
                </div>
            )}

            {/* Uploaded Files */}
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[70vh] pr-1">
                {files.map((f, idx) => (
                    <div
                        key={idx}
                        className="rounded-lg px-3 py-2 flex items-center gap-2 text-sm w-fit max-w-[90%] border border-slate-200 bg-white shadow-sm group"
                    >
                        <FileText className="h-4 w-4 text-slate-600" />
                        <span className="truncate max-w-[180px]">{f.file.name}</span>
                        {f.uploading && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
                        {!f.uploading && (
                            <button
                                onClick={() => removeFile(idx)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                            >
                                <X className="h-3 w-3 text-red-500" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FileUploadComponent
