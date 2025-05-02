import { ActionIcon, Group, Stack, Text, rem } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { IconFile, IconTrash, IconUpload, IconX } from "@tabler/icons-react";
import { useState } from "react";
import type { UseFormRegister, UseFormSetValue } from "react-hook-form";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FieldProps {
  name: string;
  label: string;
  description: string;
  setValue: UseFormSetValue<FormValues>;
  error?: { message?: string };
}

export interface FormValues {
  client: string;
  period: string;
  sections: Record<
    string,
    {
      isApplicable: boolean;
      files: Record<string, File | undefined>;
      remark: string;
    }
  >;
}

type OnUpdateComplete = (section: string, isComplete: boolean) => void;

interface FieldProps {
  name: string;
  label: string;
  description: string;
  setValue: UseFormSetValue<FormValues>;
  onUpdateComplete?: OnUpdateComplete;
  error?: { message?: string };
  isSubmitting?: boolean;
}

function FileUploadField({
  name,
  label,
  description,
  setValue,
  onUpdateComplete,
  error,
  isSubmitting,
}: FieldProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  return (
    <Dropzone
      onDrop={async (files) => {
        if (files[0]) {
          setIsUploading(true);
          try {
            const [section, field] = name.split(".");
            const file = files[0];
            // Simulate upload delay
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setValue(`sections.${section}.files`, { [field]: file });
            setUploadedFile(file);
            onUpdateComplete?.(section, true);
            notifications.show({
              title: "File uploaded",
              message: `Successfully uploaded ${file.name}`,
              color: "green",
            });
          } catch (error) {
            notifications.show({
              title: "Upload failed",
              message: "Failed to upload file. Please try again.",
              color: "red",
            });
          } finally {
            setIsUploading(false);
          }
        }
      }}
      loading={isUploading || isSubmitting}
      disabled={isSubmitting}
      onReject={(files) => {
        const file = files[0];
        const { code } = file.errors[0];
        const message =
          code === "file-too-large"
            ? "File is too large. Maximum size is 5MB"
            : "File type not supported. Please upload an image or PDF";
        notifications.show({
          title: "Error",
          message,
          color: "red",
        });
      }}
      maxSize={MAX_FILE_SIZE}
      accept={["image/png", "image/jpeg", "image/gif", "application/pdf"]}
      mb="md"
      style={{ cursor: "pointer" }}
    >
      <Group wrap="nowrap" gap="xl" mih={100} style={{ pointerEvents: "none" }}>
        <Group align="center" wrap="nowrap">
          <Dropzone.Accept>
            <IconUpload
              style={{
                width: rem(52),
                height: rem(52),
                color: "var(--mantine-color-blue-6)",
              }}
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              style={{
                width: rem(52),
                height: rem(52),
                color: "var(--mantine-color-red-6)",
              }}
              stroke={1.5}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconFile
              style={{
                width: rem(52),
                height: rem(52),
                color: "var(--mantine-color-dimmed)",
              }}
              stroke={1.5}
            />
          </Dropzone.Idle>
        </Group>
        <Stack gap="xs" style={{ flex: 1 }}>
          <Stack gap="xs" align="flex-start">
            <Text size="xl" inline fw={500}>
              {label}
            </Text>
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          </Stack>
          <Group gap="xs" align="center" style={{ position: "relative" }}>
            <Text size="sm" c={uploadedFile ? "dimmed" : undefined} inline>
              {uploadedFile ? (
                <>
                  Current file: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)}{" "}
                  MB)
                </>
              ) : (
                "Drag images or PDF here or click to select file (max 5MB)"
              )}
            </Text>
            {uploadedFile && (
              <div style={{ pointerEvents: "auto" }}>
                <ActionIcon
                  color="red"
                  size="sm"
                  variant="subtle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                    const [section, field] = name.split(".");
                    setValue(`sections.${section}.files`, {
                      [field]: undefined,
                    });
                    onUpdateComplete?.(section, false);
                    notifications.show({
                      title: "File removed",
                      message: "File has been removed",
                      color: "blue",
                    });
                  }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </div>
            )}
          </Group>
          {error && (
            <Text size="sm" c="red">
              {error.message}
            </Text>
          )}
        </Stack>
      </Group>
    </Dropzone>
  );
}

export function renderFormSection(
  section: string,
  register: UseFormRegister<FormValues>,
  setValue: UseFormSetValue<FormValues>,
  errors: Record<string, { message?: string }>,
  onUpdateComplete?: OnUpdateComplete,
  fields?: Array<{ label: string; description: string }>,
  isSubmitting?: boolean
) {
  const getFieldId = (label: string) =>
    label
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();

  const mappedFields = fields?.map((field) => ({
    name: `${section}.${getFieldId(field.label)}`,
    label: field.label,
    description: field.description,
  }));

  return (mappedFields || []).map((field) => (
    <FileUploadField
      key={field.name}
      name={field.name}
      label={field.label}
      description={field.description}
      setValue={setValue}
      onUpdateComplete={onUpdateComplete}
      error={errors[field.name]}
      isSubmitting={isSubmitting}
    />
  ));
}
