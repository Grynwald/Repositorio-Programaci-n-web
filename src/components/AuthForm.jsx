'use client';

export default function AuthForm({
    user,
    email,
    password,
    onEmailChange,
    onPasswordChange,
    onSubmit,
    onSignOut,
    authMode,
    setAuthMode,
    message
}) {
    return (
        <section className="auth-form">
            {user ? (
                <div className="auth-logged-in">
                    <p>Bienvenido, <strong>{user.email}</strong></p>
                    <button className="btn-secundario" type="button" onClick={onSignOut}>
                        Cerrar sesión
                    </button>
                </div>
            ) : (
                <form className="login-form" onSubmit={onSubmit}>
                    <div className="auth-header">
                        <h2>{authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>
                        <button
                            type="button"
                            className="btn-secundario"
                            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                        >
                            {authMode === 'login' ? 'Registrarme' : 'Ya tengo cuenta'}
                        </button>
                    </div>

                    <label>
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={event => onEmailChange(event.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Contraseña
                        <input
                            type="password"
                            value={password}
                            onChange={event => onPasswordChange(event.target.value)}
                            required
                        />
                    </label>

                    <button className="btn-finalizar" type="submit">
                        {authMode === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                    </button>

                    {message && <p className="mensaje-compra error">{message}</p>}
                </form>
            )}
        </section>
    );
}
