export default function CheckoutForm({ finalizarCompra }) {
    return (
        <form id="form-finalizar-compra" className="finalizar-compra" onSubmit={finalizarCompra}>
            <h2>Finalizar compra</h2>
            <div className="campos-compra">
                <label>
                    Nombre completo
                    <input
                        type="text"
                        name="nombre"
                        required
                        minLength={2}
                        maxLength={80}
                        pattern="[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+"
                        title="Solo letras y espacios"
                    />
                </label>
                <label>
                    Telefono
                    <input
                        type="tel"
                        name="telefono"
                        required
                        pattern="[\d\s\+\-\(\)]{6,20}"
                        title="Solo números, espacios, guiones y paréntesis"
                    />
                </label>
                <label>
                    Email
                    <input type="email" name="email" required />
                </label>
                <label>
                    Direccion de entrega
                    <input
                        type="text"
                        name="direccion"
                        required
                        minLength={5}
                        maxLength={200}
                        title="Ingresá una dirección válida"
                    />
                </label>
                <input type="hidden" name="entrega" value="Envio a domicilio" />
                <label>
                    Metodo de pago
                    <select name="pago" required defaultValue="">
                        <option value="">Seleccionar</option>
                        <option value="Mercado Pago">Mercado Pago</option>
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
