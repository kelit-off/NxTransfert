import { AppShell } from "@/components/app-shell";
import { SharedData } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import { FileIcon } from "lucide-react";
import { useState } from "react";

export default function Download() {
    const { files, token } = usePage<SharedData>().props
    const [isDownload, setIsDownload] = useState(false)
    
    const handleDownload = async (e) => {
        setIsDownload(true)

        const formData = new FormData();
        formData.append("token", token)

        axios.post('/api/download', formData)
        .then(function(reponse) {
            if(reponse.data.status == "success") {
                const a = document.createElement("a")
                a.href = reponse.data.download_url
                a.download = "archive_"+new Date().toISOString().split("T")[0]
                document.body.appendChild(a)
                a.click()
                a.remove()
                setIsDownload(false)
            }
        })
    }

    return (
        <AppShell>
            <div className="bg-black/60 border border-white rounded-2xl min-h-86 px-4 pb-4 w-fit min-w-86 flex flex-col">
                <div className="py-5 px-10 text-white">
                    {/* Titre du projet et projet mère */}
                    <h1>NxTransfert</h1>
                </div>
                <div className="rounded-md bg-white text-center flex-col flex-1 flex px-5 py-2">
                    <p className="text-sm text-[#666]">Ces fichier seront supprimés dans 30 jours.</p>
                    <div className="flex flex-1 flex-col overflow-y-auto">
                        {files.map((file, index) => {
                            return (
                                <div className="flex flex-row my-[1px]" key={index}>
                                    <FileIcon className="text-gray-400" />
                                    <div className="ml-2">
                                        <span className="text-sm font-medium">{file.name}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {/* Signalement */}
                    {/* Bouton pour télécharger */}
                    <button className="bg-green-500 rounded py-1 text-white cursor-pointer disabled:cursor-not-allowed disabled:bg-green-500/70" onClick={handleDownload} disabled={isDownload}>{(isDownload ? "Téléchargement en cours" : "Télécharger")}</button>
                </div>
            </div>
        </AppShell>
    )
} 