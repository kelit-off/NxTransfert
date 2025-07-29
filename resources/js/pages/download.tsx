import { AppShell } from "@/components/app-shell";
import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";
import { FileIcon } from "lucide-react";

export default function Download() {
    const { files } = usePage<SharedData>().props
    
    return (
        <AppShell>
            <div className="bg-black/60 border border-white rounded-2xl min-h-86 px-4 pb-4 w-fit min-w-86 flex flex-col">
                <div className="py-5 px-10 text-white">
                    {/* Titre du projet et projet mère */}
                    <h1>NxTransfert</h1>
                </div>
                <div className="rounded-md bg-white text-center flex-col flex-1 flex">
                    <p>Ces fichier seront supprimés dans 30 jours.</p>
                    <div>
                        {files.map((file, index) => {
                            return (
                                <div className="flex flex-row">
                                    <FileIcon />
                                    <div className="ml-2">
                                        <span className="text-sm">{file.name}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {/* Signalement */}
                </div>
            </div>
        </AppShell>
    )
}