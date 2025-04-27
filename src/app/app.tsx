import { Toaster } from "@/components/ui/sonner";

import { Layout } from "@/components/ui/layout";
import { PuzzleBoard } from "@/modules/PuzzleBoard/PuzzleBoard";
export const App = () => {
  return (
    <main>
      <Layout>
        <PuzzleBoard />
        <Toaster position="top-right" />
      </Layout>
    </main>
  );
};
