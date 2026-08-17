// app/page.tsx
import { redirect } from "next/navigation";

// El middleware ya protege /dashboard y /login, así que esta ruta raíz
// solo necesita decidir hacia dónde empujar — el resto lo resuelve él.
export default function RootPage() {
  redirect("/dashboard");
}
