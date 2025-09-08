export function toSlug(str: string) {
    return str
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
export function createHandleNameChange(
  setName: (name: string) => void,
  setSlug: (slug: string) => void
) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setSlug(toSlug(value));
  };
}