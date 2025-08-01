import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppModal from './app-modal';
import { FaDiscord } from "react-icons/fa";
import { IoSend } from "react-icons/io5";

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}


const backgroundImages = [
    {
        path_image: "/asset/img/montagne.jpg",
        comp: 'Photo de <a href="https://unsplash.com/fr/@v2osk?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">v2osk</a> sur <a href="https://unsplash.com/fr/photos/foggy-mountain-summit-1Z2niiBPg5A?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>'
    },
    {
        path_image: "/asset/img/foret.jpg",
        comp: 'Photo de <a href="https://unsplash.com/fr/@szmigieldesign?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Lukasz Szmigiel</a> sur <a href="https://unsplash.com/fr/photos/arbres-de-la-foret-jFCViYFYcus?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>'
    },
    {
        path_image: "/asset/img/neige.jpg",
        comp: 'Photo de <a href="https://unsplash.com/fr/@jmsdono?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">jms</a> sur <a href="https://unsplash.com/fr/photos/photo-de-montagnes-et-darbres-kFHz9Xh3PPU?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>'
    }
]

const nosReseau = [
    {
        url: "https://discord.gg/wNeFaayTNV",
        icon: <FaDiscord />
    }
]

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;
    const [backgroundImage, setBackgroundImage] = useState("")


    const preloadImage = (src) =>
    new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
    });
    useEffect(() => {
        backgroundImages.forEach(img => preloadImage(img.path_image));
        // fonction qui change l'image
        const changeImage = () => {
            const randomIndex = Math.floor(Math.random() * backgroundImages.length);
            setBackgroundImage(backgroundImages[randomIndex].path_image);
        };

        // première image au montage
        changeImage();

        // changement toutes les 10s
        const interval = setInterval(changeImage, 10000);

        // nettoyage
        return () => clearInterval(interval);
    }, [backgroundImages]);

    const handleIdee = () => {

    }

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col" style={{backgroundImage: `url(${backgroundImage})`,backgroundSize: 'cover', backgroundPosition: 'center'}}>
                <div className="flex-1 flex flex-col items-center justify-center">
                    {children}
                    <div className="flex flex-row justify-between mt-3">
                        {nosReseau.map((reseau, index) => {
                            return (
                                <a href={reseau.url} key={index} className='text-white text-2xl' target='_blank'>{reseau.icon}</a>
                            )
                        })}
                    </div>
                </div>
                <AppModal addButton={
                    <button className='cursor-pointer' onClick={handleIdee}><IoSend /></button>
                }>
                    <div className='py-2 px-3'>
                        <h4>Partager vos idées</h4>
                        <textarea name="" id=""></textarea>
                    </div>
                </AppModal>
                {/* Footer en bas de la page */}
                <div className="flex flex-col md:flex-row justify-between px-4 py-6 text-white">
                    <div>
                        {/* Qui a pris les photo */}
                    </div>
                    <div>
                        {/* Langue, information général sur le projet */}
                        <div>
                            <h1 className="text-base font-semibold">L'alternative à WeTransfer français</h1>
                            {/* <div className="space-x-2">
                                <a className="cursor-pointer" href="#">Partager <span className='underline'>vos idées</span> avec nous</a>
                                <a className="cursor-pointer" href="#">ou <span className='underline'>votre satisfaction</span></a>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
