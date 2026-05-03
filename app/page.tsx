import Demo from "./components/demo";
import EditorSection from "./components/editor-demo";
import Features from "./components/features";
import Footer from "./components/footer";
import Hero from "./components/hero";
import Navbar from "./components/navbar";
import Newsletter from "./components/newsletter";
import Partners from "./components/partners";
import Testimonials from "./components/testimonials";


export default function Home() {
  return (
    <div>
      <Navbar/>
      <Hero/>
      <Partners/>
      <Demo/>
      <Features/>
      <EditorSection/>
      <Testimonials/>
      <Newsletter/>
      <Footer/>
    </div>
  );
}
