import '../style.css';

export const metadata = {
    title: 'Gaudi | Todo para tu ritual matero',
    description: 'Mates, bombillas, termos y yerbas para tu ritual matero.'
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
            </head>
            <body>{children}</body>
        </html>
    );
}
