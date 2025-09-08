import UserForm from "../UserForm";

export default function AddUserPage() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <UserForm mode="create" />
    </div>
  );
}
