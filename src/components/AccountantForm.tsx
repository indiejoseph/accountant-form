"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Accordion,
  Box,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Paper,
  Progress,
  Select,
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
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { type FormValues, renderFormSection } from "./FormSections";

function getDefaultPeriod() {
  const currentYear = new Date().getFullYear();
  return `${currentYear - 1}-${currentYear}`;
}

const formSchema = z.object({
  client: z.string().min(1, "Client name is required"),
  period: z.string().min(1, "Period is required"),
  sections: z.record(
    z.object({
      isApplicable: z.boolean(),
      files: z.record(z.instanceof(File).optional()),
      remark: z.string(),
    })
  ),
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
  const [applicableSections, setApplicableSections] = useState<Record<string, boolean>>({});

  const router = useRouter();
  const searchParams = useSearchParams();

  const titleOptions = [
    { value: "audit", label: "Audit Documents Request List" },
    { value: "due-diligence", label: "Financial Due Diligence Checklist" },
  ];

  const handleTitleChange = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", value);
    router.replace(`?${params.toString()}`);
  };

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
      sections: formSections.reduce(
        (acc, section) => {
          acc[section.value] = {
            isApplicable: true,
            files: {},
            remark: "",
          };
          return acc;
        },
        {} as FormValues["sections"]
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
    for (const section of formSections) {
      const isApplicable = searchParams.get(section.value) !== "false";
      newApplicability[section.value] = isApplicable;
      setValue(`sections.${section.value}.isApplicable`, isApplicable);
    }
    setApplicableSections(newApplicability);
  }, [searchParams, setValue]);

  // Update form values when URL params change
  useEffect(() => {
    setValue("client", searchParams.get("client") || "");
    setValue("period", searchParams.get("period") || getDefaultPeriod());
  }, [searchParams, setValue]);

  const applicableSectionCount = formSections.filter((s) => applicableSections[s.value]).length;

  return (
    <Container size="lg" py="xl">
      <Paper shadow="sm" radius="md" p="xl" withBorder>
        <Stack gap="md" mb="xl">
          <Select
            size="lg"
            label="Document Type"
            placeholder="Select document type"
            data={titleOptions}
            defaultValue={searchParams.get("type") || "audit"}
            onChange={handleTitleChange}
            styles={(theme) => ({
              input: {
                fontSize: theme.fontSizes.lg,
                fontWeight: 500,
              },
              label: {
                fontSize: theme.fontSizes.sm,
                marginBottom: theme.spacing.xs,
              },
            })}
          />
        </Stack>

        <Stack gap="xs" mb="lg">
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

        <form
          onSubmit={handleSubmit(async (data) => {
            setIsSubmitting(true);
            try {
              // Simulate API call
              await new Promise((resolve) => setTimeout(resolve, 2000));
              // Mark applicable sections as completed
              setCompletedSections(
                formSections.filter((s) => applicableSections[s.value]).map((s) => s.value)
              );
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
          >
            {formSections.map((section) => (
              <Accordion.Item key={section.value} value={section.value}>
                <Accordion.Control>
                  <Group gap="xs" justify="space-between" w="100%">
                    <Group gap="xs">
                      <section.icon size={20} />
                      <div>
                        <Text
                          fw={500}
                          style={{
                            textDecoration:
                              searchParams.get(section.value) === "false" ? "line-through" : "none",
                          }}
                        >
                          {section.label}
                          {searchParams.get(section.value) === "false" && " (Not Applicable)"}
                        </Text>
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
                  <Stack gap="lg">
                    <Stack gap="md">
                      <Group>
                        <Text>Would this section be applicable to you?</Text>
                        <Switch
                          checked={applicableSections[section.value]}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleApplicabilityChange(section.value, e.currentTarget.checked);
                          }}
                        />
                      </Group>
                      <Textarea
                        label="Remarks"
                        placeholder="Add any notes or remarks about this section"
                        {...register(`sections.${section.value}.remark`)}
                      />
                    </Stack>
                    {applicableSections[section.value] && (
                      <Stack gap="md">
                        {renderFormSection(
                          section.value,
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
                          }
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
      </Paper>
    </Container>
  );
}
