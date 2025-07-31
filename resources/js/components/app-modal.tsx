import { useState } from "react"

export default function AppModal({children}) {
    const [show, setShow] = useState(true)

    const closeModal = () => {
        setShow(false)
    }

    return (
        <>
            <div className={`z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col rounded-2xl bg-white min-h-52 w-[800px] ${show ? "" : "hidden"}`}>
                {children}
                <div className="flex flex-1">
                    <button onClick={closeModal}>Annuler</button>
                </div>
            </div>
        </>
    )
}