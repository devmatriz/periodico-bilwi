import { AdminPasswordForm } from "@/components/admin-password-form";
import { requireStaffPage } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export default async function AdminCuentaPage() {
  // Abierta también con contraseña temporal: es justo donde se cambia.
  const user = await requireStaffPage("/admin/cuenta", { allowPendingPassword: true });

  return (
    <div className="admin-stack admin-account">
      {user.mustChangePassword ? (
        <p className="notice notice--info" role="status">
          Entraste con una contraseña temporal. Elige una propia para seguir usando el panel.
        </p>
      ) : null}

      <section className="panel">
        <h2 className="panel-title">Tus datos</h2>
        <dl className="account-facts">
          <div>
            <dt>Nombre</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt>Correo</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Cargo</dt>
            <dd>{user.role}</dd>
          </div>
          <div>
            <dt>Permisos</dt>
            <dd>{user.isAdmin ? "Administración: noticias, secciones, comentarios y equipo" : "Redacción: noticias y comentarios"}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2 className="panel-title">Cambiar contraseña</h2>
        <AdminPasswordForm pending={user.mustChangePassword} />
      </section>
    </div>
  );
}
