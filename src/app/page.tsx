import { getFormConfig } from "@/app/[id]/page";
import { AccountantForm } from "@/components/AccountantForm";
import { Container, LoadingOverlay } from "@mantine/core";
import { Suspense } from "react";

// Default table ID for the root page (first sheet in the workbook)
const DEFAULT_TABLE_ID = "0";

export default async function Home() {
  if (!process.env.NEXT_PUBLIC_DEFAULT_FORM_ID) {
    throw new Error("NEXT_PUBLIC_DEFAULT_FORM_ID is not set");
  }

  const config = await getFormConfig(DEFAULT_TABLE_ID);
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
