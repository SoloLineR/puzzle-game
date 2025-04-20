import { Toaster } from "@/components/ui/sonner";
import { ImageUploader } from "@/modules/ImageUploader/ImageUploader";
import { Layout } from "@/components/ui/layout";
export const App = () => {
  return (
    <main>
      <Layout>
        <ImageUploader />
        <Toaster position="top-right" />
      </Layout>
    </main>
  );
};
