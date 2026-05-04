export default function CheckoutForm({ finalizarCompra }) {
    return (
        <form id="form-finalizar-compra" className="finalizar-compra" onSubmit={finalizarCompra}>
            <h2>Finalizar compra</h2>
            <div className="campos-compra">
                <label>
                    Nombre completo
                    <input type="text" name="nombre" required />
                </label>
                <label>
                    Telefono
                    <input type="tel" name="telefono" required />
                </label>
                <label>
                    Email
                    <input type="email" name="email" required />
                </label>
                <label>
                    Direccion de entrega
                    <input type="text" name="direccion" required />
                </label>
                <label>
                    Metodo de entrega
                    <select name="entrega" required defaultValue="">
                        <option value="">Seleccionar</option>
                        <option value="Retiro por el local">Retiro por el local</option>
                        <option value="Envio a domicilio">Envio a domicilio</option>
                    </select>
                </label>
                <label>
                    Metodo de pago
                    <select name="pago" required defaultValue="">
                        <option value="">Seleccionar</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Tarjeta">Tarjeta</option>
                    </select>
                </label>
            </div>
            <label>
                Comentarios
                <textarea name="comentarios" rows="4" placeholder="Opcional"></textarea>
            </label>
            <button className="btn-finalizar" type="submit">Confirmar pedido</button>
        </form>
    );
}
