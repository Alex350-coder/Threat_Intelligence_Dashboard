import { Hero } from '../components/hero/Hero.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export function HomePage(): JSX.Element {
  useDocumentTitle('Home');
  return <Hero />;
}
