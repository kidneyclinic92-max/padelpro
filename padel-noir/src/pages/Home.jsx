import Hero        from '../components/Hero'
import Ticker      from '../components/Ticker'
import Showcase    from '../sections/Showcase'
import Pillars     from '../sections/Pillars'
import Reel        from '../sections/Reel'

export default function Home({ onBook }) {
  return (
    <>
      <Hero onBook={onBook} />
      <Ticker />
      <Showcase />
      <Pillars />
      <Reel />
    </>
  )
}
