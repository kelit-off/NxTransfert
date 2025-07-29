import { X } from "lucide-react";
import { useState } from "react";

export default function AppPopup({background, message, show = false}) {
    const [isShow, setIsShow] = useState(show)

    const closePopup = async () => {
        setIsShow(false)
    }

    if (!isShow) return null;

    return (
        <div role="alert" className={`fixed top-1 left-11/12 transform -translate-x-2/3 ${background} text-white p-6 rounded shadow-lg flex justify-between items-center space-x-4 z-50 max-w-sm w-full`}>
            <span>{message}</span>
            <button onClick={closePopup} aria-label="Fermer la popup" className="focus:outline-none cursor-pointer">
                <X />
            </button>
        </div>
    )
}