import FieldLabel from '@/components/vender/fields/FieldLabel';
import { VENDER_FILE_ACCEPT } from '@/lib/vender/constants';

interface VenderFileFieldProps {
  id: string;
  label: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  files: File | null | File[];
  onChange: (files: File | null | File[]) => void;
  error?: string;
}

function formatNames(files: File | null | File[]): string {
  if (files === null) return '';
  if (Array.isArray(files)) return files.map((f) => f.name).join(', ') || 'Ningún archivo';
  return files.name;
}

export default function VenderFileField({
  id,
  label,
  description,
  accept = VENDER_FILE_ACCEPT,
  multiple,
  files,
  onChange,
  error,
}: VenderFileFieldProps) {
  const valueDisplay = multiple
    ? formatNames(Array.isArray(files) ? files : [])
    : formatNames(Array.isArray(files) ? null : files);

  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {description ? <p className="text-xs text-[#5A6C7D] mb-2">{description}</p> : null}
      <input
        id={id}
        name={id}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          const list = e.target.files;
          if (!list?.length) {
            onChange(multiple ? [] : null);
            return;
          }
          if (multiple) {
            onChange(Array.from(list));
          } else {
            onChange(list[0]);
          }
        }}
        className="block w-full text-sm text-[#5A6C7D] file:mr-4 file:rounded-lg file:border-0 file:bg-[#1E3A5F] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#D9773F]"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
      />
      {valueDisplay ? <p className="mt-1 text-xs text-[#5A6C7D]">Seleccionado: {valueDisplay}</p> : null}
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
