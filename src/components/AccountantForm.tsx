"use client";

import type { FormConfig } from "@/app/[id]/page";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Accordion,
  Box,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Modal,
  Paper,
  Progress,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBuilding,
  IconCash,
  IconChartBar,
  IconCheck,
  IconCreditCard,
  IconFileText,
  IconFiles,
  IconFolders,
  IconReceipt,
  IconReportMoney,
  IconTools,
  IconUsers,
} from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { type FormValues, renderFormSection } from "./FormSections";

function getDefaultPeriod() {
  const currentYear = new Date().getFullYear();
  // Always set to next year's period (e.g., in 2024 it would be "2024-2025")
  return `${currentYear}-${currentYear + 1}`;
}

interface FormSection {
  value: string;
  label: string;
  description: string;
  fields: Array<{
    label: string;
    description: string;
  }>;
}

const formSchema = z.object({
  client: z.string().min(1, "Client name is required"),
  period: z
    .string()
    .regex(/^[0-9]{4}-[0-9]{4}$/, "Period must be in format YYYY-YYYY (e.g., 2024-2025)"),
  sections: z.record(
    z.object({
      isApplicable: z.boolean(),
      files: z.record(z.instanceof(File).optional()),
      remark: z.string(),
    })
  ),
}) satisfies z.ZodType<FormValues>;

const sectionIcons: Record<string, typeof IconFileText> = {
  general: IconFileText,
  statutoryRecord: IconBuilding,
  propertyPlantEquipment: IconTools,
  accountsReceivables: IconReceipt,
  cashAndEquivalent: IconCash,
  accountsPayables: IconCreditCard,
  revenue: IconChartBar,
  adminExpense: IconReportMoney,
  payroll: IconUsers,
  others: IconFolders,
  consolidation: IconFiles,
};

const getDefaultIcon = (sectionName: string) => {
  return sectionIcons[sectionName] || IconFileText;
};

interface AccountantFormProps {
  initialConfig: FormConfig;
}

export function AccountantForm({ initialConfig }: AccountantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [applicableSections, setApplicableSections] = useState<Record<string, boolean>>({});
  const [showThankYou, setShowThankYou] = useState(false);

  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client: searchParams.get("client") || "",
      period: searchParams.get("period") || getDefaultPeriod(),
      sections: Object.keys(initialConfig.fields).reduce(
        (acc: FormValues["sections"], sectionName) => {
          acc[sectionName] = {
            isApplicable: true,
            files: {},
            remark: "",
          };
          return acc;
        },
        {}
      ),
    },
  });

  const handleApplicabilityChange = useCallback(
    (sectionValue: string, isApplicable: boolean) => {
      setApplicableSections((prev) => ({ ...prev, [sectionValue]: isApplicable }));
      setValue(`sections.${sectionValue}`, {
        isApplicable,
        files: getValues(`sections.${sectionValue}.files`) || {},
        remark: getValues(`sections.${sectionValue}.remark`) || "",
      });
      if (!isApplicable) {
        setCompletedSections((prev) => prev.filter((s) => s !== sectionValue));
      }
    },
    [setValue, getValues]
  );

  // Initialize applicability state from URL params
  useEffect(() => {
    const newApplicability: Record<string, boolean> = {};
    for (const sectionName of Object.keys(initialConfig.fields)) {
      const isApplicable = searchParams.get(sectionName) !== "false";
      newApplicability[sectionName] = isApplicable;
      setValue(`sections.${sectionName}.isApplicable`, isApplicable);
    }
    setApplicableSections(newApplicability);
  }, [searchParams, setValue, initialConfig.fields]);

  // Update form values when URL params change
  useEffect(() => {
    setValue("client", searchParams.get("client") || "");

    // Validate period from URL params
    const urlPeriod = searchParams.get("period");
    if (urlPeriod && /^[0-9]{4}-[0-9]{4}$/.test(urlPeriod)) {
      setValue("period", urlPeriod);
    } else {
      setValue("period", getDefaultPeriod());
    }
  }, [searchParams, setValue]);

  const applicableSectionCount = Object.keys(initialConfig.fields).filter(
    (s) => applicableSections[s]
  ).length;

  return (
    <Container size="lg" py="xl">
      <Paper shadow="sm" radius="md" p="xl" withBorder>
        <Stack gap="xs" mb="lg">
          <Title order={3}>Request List</Title>
          <Progress
            value={(completedSections.length / applicableSectionCount) * 100}
            size="sm"
            color={completedSections.length === applicableSectionCount ? "green" : "blue"}
            radius="xl"
            striped
            animated={completedSections.length > 0}
          />
          <Text size="sm" c="dimmed" ta="right">
            Completed sections: {completedSections.length} / {applicableSectionCount}
          </Text>
        </Stack>

        <Box pos="relative">
          <LoadingOverlay visible={isSubmitting} />
          <form
            onSubmit={handleSubmit(async (data) => {
              setIsSubmitting(true);
              try {
                const formData = new FormData();
                formData.append("client", data.client);
                formData.append("period", data.period);

                // Collect all files from applicable sections
                for (const [sectionName, section] of Object.entries(data.sections)) {
                  if (section.isApplicable && section.files) {
                    for (const [fieldName, file] of Object.entries(section.files)) {
                      if (file) {
                        // Include section and field name in the form data
                        formData.append("files", file);
                        formData.append("fileFields", `${sectionName}/${fieldName}`);
                      }
                    }
                  }
                }

                const response = await fetch("/api/submit", {
                  method: "POST",
                  body: formData,
                });

                if (!response.ok) {
                  throw new Error("Failed to submit form");
                }

                // Mark applicable sections as completed
                setCompletedSections(
                  Object.keys(initialConfig.fields).filter((s) => applicableSections[s])
                );

                setShowThankYou(true);
              } catch (error) {
                notifications.show({
                  title: "Error",
                  message: "Failed to submit form. Please try again.",
                  color: "red",
                });
              } finally {
                setIsSubmitting(false);
              }
            })}
          >
            <Box mb="xl">
              {(errors.client || errors.period) && (
                <Text c="red" size="sm" mb="md">
                  Please fill in all required fields: Client and Period
                </Text>
              )}
              <Stack gap="md">
                <Box>
                  <TextInput
                    label="Client Name"
                    placeholder="Enter client name"
                    error={errors.client?.message}
                    disabled={isSubmitting}
                    {...register("client")}
                  />
                </Box>
                <Box>
                  <TextInput
                    label="Period"
                    placeholder={`Enter period (e.g., ${getDefaultPeriod()})`}
                    error={errors.period?.message}
                    disabled={isSubmitting}
                    {...register("period")}
                  />
                </Box>
              </Stack>
            </Box>

            <Accordion
              variant="separated"
              radius="md"
              transitionDuration={200}
              chevronPosition="left"
            >
              {Object.entries(initialConfig.fields).map(([sectionName, fields]) => (
                <Accordion.Item key={sectionName} value={sectionName}>
                  <Accordion.Control>
                    <Group gap="xs" justify="space-between" w="100%">
                      <Group gap="xs">
                        <ThemeIcon size={20} variant="default" bd={0} bg="transparent">
                          {React.createElement(getDefaultIcon(sectionName), { size: 20 })}
                        </ThemeIcon>
                        <div>
                          <Text
                            fw={500}
                            style={{
                              textDecoration:
                                searchParams.get(sectionName) === "false" ? "line-through" : "none",
                            }}
                          >
                            {fields[0]?.label || sectionName}
                            {searchParams.get(sectionName) === "false" && " (Not Applicable)"}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {fields[0]?.description || ""}
                          </Text>
                        </div>
                      </Group>
                      {completedSections.includes(sectionName) && (
                        <ThemeIcon color="green" size="sm" variant="light">
                          <IconCheck size={14} />
                        </ThemeIcon>
                      )}
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel p="md">
                    <Stack gap="lg">
                      <Stack gap="md">
                        <Group>
                          <Text>Would this section be applicable to you?</Text>
                          <Switch
                            checked={applicableSections[sectionName]}
                            disabled={isSubmitting}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleApplicabilityChange(sectionName, e.currentTarget.checked);
                            }}
                          />
                        </Group>
                        <Textarea
                          label="Remarks"
                          placeholder="Add any notes or remarks about this section"
                          disabled={isSubmitting}
                          {...register(`sections.${sectionName}.remark`)}
                        />
                      </Stack>
                      {applicableSections[sectionName] && (
                        <Stack gap="md">
                          {renderFormSection(
                            sectionName,
                            register,
                            setValue,
                            errors,
                            (section, isComplete) => {
                              if (isComplete) {
                                setCompletedSections((prev) =>
                                  prev.includes(section) ? prev : [...prev, section]
                                );
                              } else {
                                setCompletedSections((prev) => prev.filter((s) => s !== section));
                              }
                            },
                            initialConfig.fields[sectionName],
                            isSubmitting
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>

            <Stack mt="xl" mb="md">
              <Group justify="flex-end">
                <Tooltip
                  label={
                    !getValues("client") ||
                    !getValues("period") ||
                    completedSections.length !== applicableSectionCount
                      ? "Please fill in all required fields and complete all applicable sections before submitting"
                      : ""
                  }
                  position="top"
                  disabled={Boolean(
                    completedSections.length === applicableSectionCount &&
                      getValues("client") &&
                      getValues("period")
                  )}
                >
                  <Button
                    type="submit"
                    color="blue"
                    loading={isSubmitting}
                    disabled={
                      isSubmitting ||
                      !getValues("client") ||
                      !getValues("period") ||
                      completedSections.length !== applicableSectionCount
                    }
                  >
                    Submit
                  </Button>
                </Tooltip>
              </Group>
            </Stack>
          </form>
        </Box>
      </Paper>

      <Modal
        opened={showThankYou}
        onClose={() => setShowThankYou(false)}
        title="Thank You!"
        centered
        size="md"
      >
        <Stack gap="md" py="md">
          <Text>
            Thank you for submitting your documents. They have been successfully uploaded and sent
            via email.
          </Text>
          <Text>
            We will review your submission and get back to you if we need any additional
            information.
          </Text>
          <Button onClick={() => setShowThankYou(false)} fullWidth>
            Close
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
}
