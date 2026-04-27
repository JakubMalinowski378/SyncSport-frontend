import { useEffect, useMemo } from 'react';
import { Button, Form } from 'react-bootstrap';

interface ImageUploadReorderProps {
  label: string;
  images: File[];
  onChange: (images: File[]) => void;
  existingImageUrls?: unknown[];
  onExistingImageUrlsChange?: (images: string[]) => void;
  existingLabel?: string;
  removeTitle?: string;
}

const toImageUrl = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const candidate = record.url ?? record.imageUrl ?? record.src ?? record.path;

    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
  }

  return null;
};

export default function ImageUploadReorder({
  label,
  images,
  onChange,
  existingImageUrls = [],
  onExistingImageUrlsChange,
  existingLabel = 'Dodane zdjęcia',
  removeTitle = 'Usuń zdjęcie'
}: ImageUploadReorderProps) {
  const normalizedExistingImageUrls = useMemo(
    () => existingImageUrls
      .map(item => toImageUrl(item))
      .filter((item): item is string => Boolean(item)),
    [existingImageUrls]
  );

  const previews = useMemo(
    () => images.map(image => ({ file: image, url: URL.createObjectURL(image) })),
    [images]
  );

  useEffect(() => {
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    onChange([...images, ...Array.from(e.target.files)]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, imageIndex) => imageIndex !== index));
  };

  const removeExistingImage = (index: number) => {
    if (!onExistingImageUrlsChange) {
      return;
    }

    onExistingImageUrlsChange(
      normalizedExistingImageUrls.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) {
      return;
    }

    const reordered = [...images];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    onChange(reordered);
  };

  const moveExistingImage = (index: number, direction: -1 | 1) => {
    if (!onExistingImageUrlsChange) {
      return;
    }

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= normalizedExistingImageUrls.length) {
      return;
    }

    const reordered = [...normalizedExistingImageUrls];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    onExistingImageUrlsChange(reordered);
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        className="bg-card text-body border-secondary"
      />

      {(normalizedExistingImageUrls.length > 0 || previews.length > 0) && (
        <>
          {normalizedExistingImageUrls.length > 0 && (
            <div className="small text-secondary mt-2 mb-1">{existingLabel}</div>
          )}
          <div className="d-flex flex-wrap gap-2 mt-2">
            {normalizedExistingImageUrls.map((imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                className="border border-secondary rounded p-1"
                style={{ width: '112px' }}
              >
                <img
                  src={imageUrl}
                  alt={`existing-${index}`}
                  style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                />

                {onExistingImageUrlsChange && (
                  <div
                    className="d-grid gap-1 mt-1"
                    style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
                  >
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="w-100 py-0"
                      style={{ minHeight: '24px', paddingInline: '0.2rem' }}
                      title="Przesuń w lewo"
                      onClick={() => moveExistingImage(index, -1)}
                      disabled={index === 0}
                      type="button"
                    >
                      ←
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="w-100 py-0"
                      style={{ minHeight: '24px', paddingInline: '0.2rem' }}
                      title="Przesuń w prawo"
                      onClick={() => moveExistingImage(index, 1)}
                      disabled={index === normalizedExistingImageUrls.length - 1}
                      type="button"
                    >
                      →
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="w-100 py-0"
                      style={{ minHeight: '24px', paddingInline: '0.2rem' }}
                      title={removeTitle}
                      onClick={() => removeExistingImage(index)}
                      type="button"
                    >
                      ×
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {previews.map((preview, index) => (
              <div
                key={`${preview.file.name}-${preview.file.size}-${index}`}
                className="position-relative border border-secondary rounded p-1"
                style={{ width: '112px' }}
              >
                <img
                  src={preview.url}
                  alt={`preview-${index}`}
                  style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                />
                <div
                  className="d-grid gap-1 mt-1"
                  style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
                >
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="w-100 py-0"
                    style={{ minHeight: '24px', paddingInline: '0.2rem' }}
                    title="Przesuń w lewo"
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    type="button"
                  >
                    ←
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="w-100 py-0"
                    style={{ minHeight: '24px', paddingInline: '0.2rem' }}
                    title="Przesuń w prawo"
                    onClick={() => moveImage(index, 1)}
                    disabled={index === previews.length - 1}
                    type="button"
                  >
                    →
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-100 py-0"
                    style={{ minHeight: '24px', paddingInline: '0.2rem' }}
                    title={removeTitle}
                    onClick={() => removeImage(index)}
                    type="button"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Form.Group>
  );
}
