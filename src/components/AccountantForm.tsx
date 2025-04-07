"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Accordion,
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Paper,
  Progress,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
  rem,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import {
  IconBuilding,
  IconCash,
  IconChartBar,
  IconCheck,
  IconCreditCard,
  IconFile,
  IconFileText,
  IconFiles,
  IconFolders,
  IconReceipt,
  IconReportMoney,
  IconTools,
  IconTrash,
  IconUpload,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { type FormValues, renderFormSection } from "./FormSections";

function getDefaultPeriod() {
  const currentYear = new Date().getFullYear();
  return `${currentYear - 1}-${currentYear}`;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const formSchema = z.object({
  client: z.string().min(1, "Client name is required"),
  period: z.string().min(1, "Period is required"),
  sections: z.record(z.record(z.instanceof(File).optional())),
}) satisfies z.ZodType<FormValues>;

const formSections = [
  {
    label: "General",
    value: "general",
    description: "Management accounts and basic information",
    icon: IconFileText,
  },
  {
    label: "Statutory Record",
    value: "statutoryRecord",
    description: "Business registration and company documents",
    icon: IconBuilding,
  },
  {
    label: "Property, Plant & Equipment",
    value: "propertyPlantEquipment",
    description: "Fixed assets and insurance details",
    icon: IconTools,
  },
  {
    label: "Accounts Receivables",
    value: "accountsReceivables",
    description: "Aging and settlements",
    icon: IconReceipt,
  },
  {
    label: "Cash & Equivalent",
    value: "cashAndEquivalent",
    description: "Bank statements and reconciliations",
    icon: IconCash,
  },
  {
    label: "Accounts Payables",
    value: "accountsPayables",
    description: "Payment vouchers and aging",
    icon: IconCreditCard,
  },
  {
    label: "Revenue",
    value: "revenue",
    description: "Sales records and income details",
    icon: IconChartBar,
  },
  {
    label: "Administrative Expense",
    value: "adminExpense",
    description: "Rental and management fees",
    icon: IconReportMoney,
  },
  {
    label: "Payroll",
    value: "payroll",
    description: "Salary and employment forms",
    icon: IconUsers,
  },
  {
    label: "Others",
    value: "others",
    description: "Tax returns and correspondence",
    icon: IconFolders,
  },
  {
    label: "Consolidation",
    value: "consolidation",
    description: "Spreadsheets and trial balance",
    icon: IconFiles,
  },
];

export function AccountantForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

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
      sections: {},
    },
  });

  // Update form values when URL params change
  useEffect(() => {
    setValue("client", searchParams.get("client") || "");
    setValue("period", searchParams.get("period") || getDefaultPeriod());
  }, [searchParams, setValue]);

  return (
    <Container size="lg" py="xl">
      <Paper shadow="sm" radius="md" p="xl" withBorder>
        <Title order={2} mb="md">
          Audit Documents Request List
        </Title>

        <Stack gap="xs" mb="lg">
          <Progress
            value={(completedSections.length / formSections.length) * 100}
            size="sm"
            color={completedSections.length === formSections.length ? "green" : "blue"}
            radius="xl"
            striped
            animated={
              completedSections.length > 0 && completedSections.length < formSections.length
            }
          />
          <Text size="sm" c="dimmed" ta="right">
            Completed sections: {completedSections.length} / {formSections.length}
          </Text>
        </Stack>

        <form
          onSubmit={handleSubmit(async (data) => {
            setIsSubmitting(true);
            try {
              // Simulate API call
              await new Promise((resolve) => setTimeout(resolve, 2000));
              // Mark all sections as completed
              setCompletedSections(formSections.map((section) => section.value));
              console.log("Form data with files:", data);
              notifications.show({
                title: "Success",
                message: "Form submitted successfully",
                color: "green",
              });
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
          <LoadingOverlay visible={isSubmitting} />
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
                  {...register("client")}
                />
              </Box>
              <Box>
                <TextInput
                  label="Period"
                  placeholder={`Enter period (e.g., ${getDefaultPeriod()})`}
                  error={errors.period?.message}
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
            onChange={(value) => {
              if (!value) return;

              const section = formSections.find((s) => s.value === value);
              if (!section) return;

              const sectionData = getValues()?.sections?.[section.value] || {};
              const isValid = Object.values(sectionData).some((val) => val instanceof File);

              if (isValid) {
                setCompletedSections((prev) =>
                  prev.includes(section.value) ? prev : [...prev, section.value]
                );
              }
            }}
          >
            {formSections.map((section) => (
              <Accordion.Item key={section.value} value={section.value}>
                <Accordion.Control>
                  <Group gap="xs" justify="space-between" w="100%">
                    <Group gap="xs">
                      <section.icon size={20} />
                      <div>
                        <Text fw={500}>{section.label}</Text>
                        <Text size="sm" c="dimmed">
                          {section.description}
                        </Text>
                      </div>
                    </Group>
                    {completedSections.includes(section.value) && (
                      <ThemeIcon color="green" size="sm" variant="light">
                        <IconCheck size={14} />
                      </ThemeIcon>
                    )}
                  </Group>
                </Accordion.Control>
                <Accordion.Panel p="md">
                  {renderFormSection(section.value, register, setValue, errors)}
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
                  completedSections.length !== formSections.length
                    ? "Please fill in all required fields and complete all sections before submitting"
                    : ""
                }
                position="top"
                disabled={Boolean(
                  completedSections.length === formSections.length &&
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
                    completedSections.length !== formSections.length ||
                    !getValues("client") ||
                    !getValues("period")
                  }
                >
                  Submit
                </Button>
              </Tooltip>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
