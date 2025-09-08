import UserForm from "../UserForm";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const res = await fetch(`${process.env.APP_URL || ""}/api/user/${params.id}`, { cache: "no-store" });
  if (!res.ok) {
    return <div className="p-6 text-red-600">Không tải được người dùng.</div>;
  }
  const user = await res.json();
  return (
    <div className="max-w-5xl mx-auto p-6">
      <UserForm mode="edit" initial={user} />
    </div>
  );
}
