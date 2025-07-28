import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}


const backgroundImages = [
    'https://images.unsplash.com/photo-1682685797661-9e0c87f59c60?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
]

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;
    const [backgroundImage, setBackgroundImage] = useState("")

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        setBackgroundImage(backgroundImages[randomIndex]);
    }, []);

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col" style={{backgroundImage: `url(${backgroundImage})`,backgroundSize: 'cover', backgroundPosition: 'center'}}>
                <div className="flex-1 flex items-center justify-center">
                    {children}
                </div>

                {/* Footer en bas de la page */}
                <div className="flex flex-col md:flex-row justify-between px-4 py-6 text-white">
                    <div>
                        {/* Qui a pris les photo */}
                    </div>
                    <div>
                        {/* Langue, information général sur le projet */}
                        <div>
                            <h1 className="text-base font-semibold">L'alternative à WeTransfer français</h1>
                            <div className="space-x-2">
                                <a className="cursor-pointer" href="#">Partager <span className='underline'>vos idées</span> avec nous</a>
                                <a className="cursor-pointer" href="#">ou <span className='underline'>votre satisfaction</span></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
