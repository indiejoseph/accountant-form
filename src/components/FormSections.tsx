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
}

function FileUploadField({
  name,
  label,
  description,
  setValue,
  onUpdateComplete,
  error,
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
      loading={isUploading}
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
  onUpdateComplete?: OnUpdateComplete
) {
  const getFields = () => {
    switch (section) {
      case "general":
        return [
          {
            name: "general.managementAccount",
            label: "Management Account",
            description:
              "Monthly management accounts including P&L, balance sheet, and cash flow statements",
          },
        ];
      case "statutoryRecord":
        return [
          {
            name: "statutoryRecord.businessRegistration",
            label: "Business Registration",
            description: "Business registration certificate and related documents",
          },
          {
            name: "statutoryRecord.annualReturn",
            label: "Annual Return",
            description: "Latest annual return filed with the Companies Registry",
          },
          {
            name: "statutoryRecord.companyRegistryDocs",
            label: "Company Registry Documents",
            description: "All statutory documents filed with the Companies Registry",
          },
          {
            name: "statutoryRecord.statutoryRecords",
            label: "Statutory Records",
            description: "Minutes of meetings, resolutions, and other statutory records",
          },
        ];
      case "propertyPlantEquipment":
        return [
          {
            name: "propertyPlantEquipment.fixedAssetRegister",
            label: "Fixed Asset Register",
            description: "Detailed listing of all fixed assets with cost and depreciation details",
          },
          {
            name: "propertyPlantEquipment.insurancePolicy",
            label: "Insurance Policy",
            description: "Current insurance policies covering company assets",
          },
          {
            name: "propertyPlantEquipment.supportingInvoice",
            label: "Supporting Invoice",
            description: "Purchase invoices and related documents for major assets",
          },
          {
            name: "propertyPlantEquipment.impairmentCalculation",
            label: "Impairment Calculation",
            description: "Analysis and supporting documents for asset impairment testing",
          },
        ];
      case "accountsReceivables":
        return [
          {
            name: "accountsReceivables.aging",
            label: "Aging",
            description: "Detailed aging analysis of accounts receivable",
          },
          {
            name: "accountsReceivables.subsequentSettlement",
            label: "Subsequent Settlement",
            description: "Records of payments received after period end",
          },
          {
            name: "accountsReceivables.creditTerms",
            label: "Credit Terms",
            description: "Customer credit policies and agreements",
          },
          {
            name: "accountsReceivables.impairmentProvision",
            label: "Impairment Provision",
            description: "Calculation and basis for bad debt provisions",
          },
        ];
      case "cashAndEquivalent":
        return [
          {
            name: "cashAndEquivalent.bankStatements",
            label: "Bank Statements",
            description: "Monthly bank statements for all accounts",
          },
          {
            name: "cashAndEquivalent.bankConfirmation",
            label: "Bank Confirmation",
            description: "Bank confirmation letters and correspondence",
          },
          {
            name: "cashAndEquivalent.bankReconciliations",
            label: "Bank Reconciliations",
            description: "Monthly bank reconciliation statements",
          },
        ];
      case "accountsPayables":
        return [
          {
            name: "accountsPayables.aging",
            label: "Aging",
            description: "Detailed aging analysis of accounts payable",
          },
          {
            name: "accountsPayables.paymentVouchers",
            label: "Payment Vouchers",
            description: "Payment vouchers and supporting documents",
          },
          {
            name: "accountsPayables.subsequentPayment",
            label: "Subsequent Payment",
            description: "Records of payments made after period end",
          },
        ];
      case "revenue":
        return [
          {
            name: "revenue.salesDiscount",
            label: "Sales Discount",
            description: "Sales discount policies and calculations",
          },
          {
            name: "revenue.salesVouchers",
            label: "Sales Vouchers",
            description: "Sales vouchers and related documents",
          },
          {
            name: "revenue.cutoffTestSales",
            label: "Cut-off Test Sales",
            description: "Documentation for revenue recognition at period end",
          },
          {
            name: "revenue.cutoffTestCost",
            label: "Cut-off Test Cost",
            description: "Documentation for cost recognition at period end",
          },
          {
            name: "revenue.salesRegister",
            label: "Sales Register",
            description: "Detailed sales transactions record",
          },
          {
            name: "revenue.sundryIncome",
            label: "Sundry Income",
            description: "Other income documentation and analysis",
          },
        ];
      case "adminExpense":
        return [
          {
            name: "adminExpense.rentalAgreements",
            label: "Rental Agreements",
            description: "Office and equipment rental contracts",
          },
          {
            name: "adminExpense.managementFee",
            label: "Management Fee",
            description: "Management fee calculations and agreements",
          },
          {
            name: "adminExpense.legalFees",
            label: "Legal Fees",
            description: "Legal invoices and related documents",
          },
          {
            name: "adminExpense.sundryExpenses",
            label: "Sundry Expenses",
            description: "Other administrative expense documents",
          },
        ];
      case "payroll":
        return [
          {
            name: "payroll.salaryBreakdown",
            label: "Salary Breakdown",
            description: "Detailed salary calculations and summaries",
          },
          {
            name: "payroll.annualLeave",
            label: "Annual Leave",
            description: "Annual leave records and calculations",
          },
          {
            name: "payroll.ir56b",
            label: "IR56B Form",
            description: "Employee remuneration reporting form",
          },
          {
            name: "payroll.ir56e",
            label: "IR56E Form",
            description: "Notification for employee departure",
          },
          {
            name: "payroll.ir56f",
            label: "IR56F Form",
            description: "Notification for employee arrival",
          },
        ];
      case "others":
        return [
          {
            name: "others.latestTaxReturn",
            label: "Latest Tax Return",
            description: "Most recent tax return and computations",
          },
          {
            name: "others.taxCorrespondence",
            label: "Tax Correspondence",
            description: "Correspondence with tax authorities",
          },
        ];
      case "consolidation":
        return [
          {
            name: "consolidation.spreadsheet",
            label: "Spreadsheet",
            description: "Consolidation workings and calculations",
          },
          {
            name: "consolidation.trialBalance",
            label: "Trial Balance",
            description: "Final trial balance for the period",
          },
          {
            name: "consolidation.auditedReport",
            label: "Audited Report",
            description: "Previous year's audited financial statements",
          },
        ];
      default:
        return [];
    }
  };

  return getFields().map((field) => (
    <FileUploadField
      key={field.name}
      name={field.name}
      label={field.label}
      description={field.description}
      setValue={setValue}
      onUpdateComplete={onUpdateComplete}
      error={errors[field.name]}
    />
  ));
}
