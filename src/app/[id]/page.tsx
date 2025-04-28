import { AccountantForm } from "@/components/AccountantForm";
import { Container, LoadingOverlay } from "@mantine/core";
import { parse } from "csv-parse/sync";
import { Suspense } from "react";

export const runtime = "edge";

interface FormField {
  label: string;
  description: string;
  section: string;
}

export interface FormConfig {
  fields: Record<string, FormField[]>;
}

export async function getFormConfig(sheetId: string): Promise<FormConfig> {
  console.log(`Fetching CSV data for sheet: ${sheetId}`);
  try {
    const response = await fetch(
      `https://docs.google.com/spreadsheets/d/${process.env.NEXT_PUBLIC_DEFAULT_FORM_ID}/export?format=csv&id=${process.env.NEXT_PUBLIC_DEFAULT_FORM_ID}&gid=${sheetId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV data: ${response.statusText}`);
    }

    const csvData = await response.text();
    const records = parse(csvData, {
      skip_empty_lines: true,
      trim: true,
      columns: true,
    }) as Array<{ label: string; description: string; "section name": string }>;

    // Group fields by section
    const fieldsBySection = records.reduce((acc: Record<string, FormField[]>, row) => {
      if (!acc[row["section name"]]) {
        acc[row["section name"]] = [];
      }
      acc[row["section name"]].push({
        label: row.label,
        description: row.description,
        section: row["section name"],
      });
      return acc;
    }, {});

    return {
      fields: fieldsBySection,
    };
  } catch (error) {
    console.error("Error fetching or parsing CSV data:", error);
    throw error;
  }
}

export default async function FormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!process.env.NEXT_PUBLIC_DEFAULT_FORM_ID) {
    throw new Error("NEXT_PUBLIC_DEFAULT_FORM_ID is not set");
  }
  const { id } = await params;
  const config = await getFormConfig(id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <Container size="lg" py="xl">
            <LoadingOverlay visible={true} zIndex={1} overlayProps={{ radius: "sm", blur: 2 }} />
          </Container>
        }
      >
        <AccountantForm initialConfig={config} />
      </Suspense>
    </div>
  );
}
