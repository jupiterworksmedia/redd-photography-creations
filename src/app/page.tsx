import { getPhotos, getSettings, getCategories, getHeroSlides } from '@/lib/db';
import HomeClient from '@/components/HomeClient';

// Ensure fresh data on every request
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const photos = getPhotos(); // Only photos of enabled categories
  const settings = getSettings();
  const categories = getCategories(false); // Only active/enabled categories
  const slides = getHeroSlides(false); // Only active/enabled hero slides

  return (
    <HomeClient
      initialPhotos={photos}
      settings={settings}
      categories={categories}
      slides={slides}
    />
  );
}

