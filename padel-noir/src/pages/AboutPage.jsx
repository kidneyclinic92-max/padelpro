import PageHero   from '../components/PageHero'
import About      from '../components/About'
import BookingCTA from '../components/BookingCTA'
import { useSiteContent } from '../context/SiteContentContext'

export default function AboutPage({ onBook }) {
  const { content } = useSiteContent()
  return (
    <>
      <PageHero {...content.pageHero.about} />
      <About />
      <BookingCTA onBook={onBook} />
    </>
  )
}
