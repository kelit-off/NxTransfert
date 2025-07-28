import { AppShell } from "@/components/app-shell";
import axios from "axios";
import { FileIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Upload() {
    const [files, setFiles] = useState([])
    const [message, setMessage] =useState("")
    const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
        inputRef.current.setAttribute("webkitdirectory", "");
        inputRef.current.setAttribute("directory", "");
        }
    }, []);

    const changeFile = (e) => {
        setHasAttemptedUpload(true)
        const selectedFiles = Array.from(e.target.files || []);
        setFiles(selectedFiles)
    }

    const changeMessage = (e) => {
        setMessage(e.target.value)
    }

    const handleUpload = async () => {
        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append('files[]', file);
        });
        formData.append('message', message)

        axios.post("/api/upload", formData)
        .then(function(reponse) {
            console.log(reponse)
        })
        .catch(function(error) {
            console.log(error)
        })
    }

    return (
        <AppShell>
            <div className="bg-black/60 border border-white rounded-2xl min-h-86 px-4 pb-4 w-fit min-w-86 flex flex-col">
                <div className="py-5 px-10 text-white">
                    {/* Titre du projet et projet mère */}
                    <h1>NxTransfert</h1>
                </div>
                <div className="rounded-md bg-white text-center flex-1 flex">
                    {!hasAttemptedUpload ? (
                        <div className="flex flex-col flex-1 justify-center">
                            <div className="flex justify-center">
                                <label htmlFor="input_file" className="cursor-pointer size-12 bg-green-400 hover:bg-green-500 rounded-xl flex justify-center items-center">
                                    <img className="w-[25px] h-auto" src="/asset/svg/icon-plus.svg" alt="" />
                                </label>
                                <span className="hidden">Ajouter un fichier</span>
                            </div>
                        
                            <input type="file" name="input_file" id="input_file" className="hidden" multiple onChange={changeFile}/>
                            <p className="text-lg font-semibold text-black">
                                Cliquez pour ajouter vos fichiers
                            </p>
                            <p className="mt-0.5 text-sm text-gray-400">
                                <label htmlFor="input_directory" className="hover:underline cursor-pointer text-green-400 font-semibold hover:text-green-500">Ajouter un dossier</label>
                                <input type="file" name="input_directory" id="input_directory" className="hidden" ref={inputRef} onChange={changeFile}/>
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-row flex-1 min-w-3xl h-[547px] px-5">
                            <div className="flex flex-col flex-1 py-3">
                                {/* Tout les fichier */}
                                <div className="w-full">
                                    <p className="" >{ files.length } fichier{ files.length > 1 ? "s" : ""} téléchargé{ files.length > 1 ? "s" : ""}</p>
                                </div>
                                <div className="scroll flex flex-col h-9/12 overflow-y-auto p-3 bg-gray-200 rounded-md mt-5">
                                    {/* Les fichiers */}
                                    {files.map((file, index) => {
                                        return (
                                            <div key={index} className="flex flex-row justify-between px-5">
                                                <div className="flex flex-row">
                                                    <FileIcon />
                                                    <div className="ml-2">
                                                        <span className="text-sm">{file.name}</span>
                                                    </div>
                                                </div>
                                                <button className="cursor-pointer">
                                                    <X />
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex flex-row justify-left py-5">
                                    {/* Ajouter des fichier ou dossier*/}
                                    <label htmlFor="input_file" className="cursor-pointer size-12 bg-green-400 hover:bg-green-500 rounded-xl flex justify-center items-center mr-3">
                                        <img className="w-[25px] h-auto" src="/asset/svg/icon-plus.svg" alt="" />
                                    </label>
                                    <input type="file" name="input_file" id="input_file" className="hidden" multiple onChange={changeFile}/>
                                    <div>
                                        <label htmlFor="input_file" className="cursor-pointer">Ajoutez vos fichiers</label>
                                        <p className="mt-0.5 text-sm text-gray-400">
                                            <label htmlFor="input_directory" className="hover:underline cursor-pointer text-green-400 font-semibold hover:text-green-500">Ajouter un dossier</label>
                                            <input type="file" name="input_directory" id="input_directory" className="hidden" ref={inputRef} onChange={changeFile}/>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col flex-1 px-5 py-10">
                                {/* Information sur l'envoie */}
                                {/* <div className="flex flex-row">
                                    <button>

                                    </button>
                                    <button>

                                    </button>
                                </div> */}
                                <div className="flex flex-col flex-1">
                                    <textarea className="border rounded py-0.5 px-1 h-44" name="" id="" placeholder="Votre message" onChange={changeMessage}></textarea>
                                </div>
                                <button className="bg-green-400 rounded text-white cursor-pointer mt-10 h-9" onClick={handleUpload}>
                                    Transférer
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    )
}