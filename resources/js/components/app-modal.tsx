import { useState } from "react"

export default function AppModal({children, addButton, show, onClose}) {

    const closeModal = () => {
        if(onClose) {
            onClose()
        }
    }

    if (!show) {
        return null;
    }

    return (
        <>  
            <div className={`flex flex-1 fixed h-screen w-screen bg-black/70 ${show ? "" : "hidden"}`} onClick={closeModal}>

            </div>
            <div className={`z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col rounded-2xl bg-white w-10/12 min-h-4/12 md:min-h-52 md:w-[400px] ${show ? "" : "hidden"}`}>
                <div className="flex flex-1">
                    {children}
                </div>
                <div className="flex flex-row justify-between w-full py-2 px-5">
                    <button className="py-1 px-2 rounded-xl border border-red-500 hover:bg-red-500 hover:text-white cursor-pointer" onClick={closeModal}>Annuler</button>
                    {addButton}
                </div>
            </div>
        </>
    )
}