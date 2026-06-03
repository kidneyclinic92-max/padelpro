import PageHero   from '../components/PageHero'
import Courts     from '../components/Courts'
import BookingCTA from '../components/BookingCTA'
import { useSiteContent } from '../context/SiteContentContext'

export default function CourtsPage({ onBook }) {
  const { content } = useSiteContent()
  return (
    <div className="courts-page">
      <PageHero {...content.pageHero.courts} />
      <Courts onBook={onBook} />
      <BookingCTA onBook={onBook} />
    </div>
  )
}
