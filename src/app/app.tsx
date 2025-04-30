import {Toaster} from '@/components/ui/sonner';

import {Layout} from '@/components/ui/layout';
import {ImageUploader} from '@/modules/ImageUploader/ImageUploader';

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
