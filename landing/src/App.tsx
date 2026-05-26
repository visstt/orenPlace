import { Background } from './components/Background';
import { Cta } from './components/Cta';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';

export default function App() {
  return (
    <>
      <Background />
      <Header />
      <main>
        <Hero />
        <Features />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
