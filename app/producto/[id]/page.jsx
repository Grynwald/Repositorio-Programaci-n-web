import App from '../../../src/App.jsx';
import { productos } from '../../../src/data/productos.js';

export function generateStaticParams() {
    return productos
        .flatMap(categoria => categoria.items)
        .map(producto => ({ id: producto.id }));
}

export default function ProductoPage() {
    return <App />;
}
