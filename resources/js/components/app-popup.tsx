import { X } from "lucide-react";

export default function AppPopup({ background, message, show, onClose }) {
  if (!show) return null;

  return (
    <div
      role="alert"
      className={`fixed top-4 right-4 ${background} text-white p-4 rounded shadow-lg flex justify-between items-center space-x-4 z-50 max-w-sm w-full`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        aria-label="Fermer la popup"
        className="focus:outline-none cursor-pointer"
      >
        <X />
      </button>
    </div>
  );
}
