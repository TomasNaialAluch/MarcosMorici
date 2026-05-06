interface FieldLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}

export default function FieldLabel({ htmlFor, children, required }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className="block text-[13px] font-medium text-[#1E3A5F] mb-1">
      {children}
      {required ? <span className="text-[#D9773F]"> *</span> : null}
    </label>
  );
}
