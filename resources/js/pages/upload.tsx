import AppPopup from "@/components/app-popup";
import { AppShell } from "@/components/app-shell";
import axios from "axios";
import { CopyIcon, FileCheck, FileIcon, X } from "lucide-react";
import { use, useEffect, useRef, useState } from "react";

export default function Upload() {
    const [files, setFiles] = useState([])
    const [message, setMessage] = useState("")
    const [urlDownload, setUrlDownload] = useState(null)
    const [expiration, setExpiration] = useState([])
    const [loading, setLoading] = useState(false)
    const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false)
    const [show, setShow] = useState(false)
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

    const handleUpload = async (e) => {
        setLoading(true)
        console.log(e)
        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append('files[]', file);
        });
        formData.append('message', message)

        axios.post("/api/upload", formData)
        .then(function(reponse) {
            if(reponse.data.status == "success") {
                setUrlDownload(reponse.data.url)
                const date = new Date(reponse.data.date_expiration)
                console.log(date)
                const formatted = new Intl.DateTimeFormat('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }).format(date)
                console.log(formatted)
                const [datePart, timePart] = formatted.split(' ');
                console.log(date)
                console.log(timePart)
                setExpiration({date: datePart, heure: timePart})
            }
        })
        .catch(function(error) {
            console.log(error)
        })
        .finally(function() {
            setLoading(false)
        })
    }

    const newTransfert = async () => {
        setFiles([])
        setUrlDownload(null)
        setMessage("")
        setExpiration([])
        setLoading(false)
        setHasAttemptedUpload(false)
        setShow(false)
    }

    const copyUrl = (e) => {
        navigator.clipboard.writeText(urlDownload)
        setShow(true)
    }

    return (
        <AppShell>
            <AppPopup background={'bg-green-400'} message={"Copier avec succès"} show={show} />
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
                    ) : urlDownload != null ? (
                        <div className="min-w-md max-w-md px-5 py-4">
                            {/* Icon */}
                            <div className="flex flex-1 justify-center items-center mb-6">
                                <img className="rounded-full w-[140px]" src="\asset\svg\success.svg" alt="Image de fusée pour montré le succès de l'envoie" />
                            </div>
                            <h1 className="text-3xl font-bold">Félicitations!</h1>
                            <p className="text-base text-gray-500 mb-3">Lien de téléchargement à partager :</p>
                            <div className="items-center flex flex-row justify-between rounded bg-gray-100 mb-1" onClick={copyUrl}>
                                {/* Le lien et pour copier */}
                                <input className="focus:outline-0 w-full px-1" type="text" value={urlDownload} readOnly/>
                                <button className="cursor-pointer text-center bg-green-400 rounded-r py-1 px-4 text-white"><CopyIcon /></button>
                            </div>
                            <p className="mb-10">
                                Ce lien expirera le <span className="text-base">{expiration.date}</span> à <span className="text-base">{expiration.heure}</span>
                            </p>
                            {/* Pour faire un nouveau téléchargement */}
                            <button className="rounded bg-green-500 px-2 py-1 text-white w-full cursor-pointer" onClick={newTransfert}>
                                Nouveau transfert?
                            </button>
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
                                <button className="bg-green-400 rounded text-white cursor-pointer mt-10 h-9 disabled:bg-green-400/10 disabled:cursor-default" onClick={handleUpload} disabled={loading}>
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