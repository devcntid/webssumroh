interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}

export function Field({ label, required, children, error }: FieldProps) {
  return (
    <div className="admin-field">
      <label>
        {label}
        {required && <span className="req"> *</span>}
      </label>
      {children}
      {error && (
        <div style={{ color: "var(--admin-er)", fontSize: 11, marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
}
