import { AccountantForm } from "@/components/AccountantForm";
import { Container, LoadingOverlay } from "@mantine/core";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <Container size="lg" py="xl">
            <LoadingOverlay visible={true} zIndex={1} overlayProps={{ radius: "sm", blur: 2 }} />
          </Container>
        }
      >
        <AccountantForm />
      </Suspense>
    </div>
  );
}
