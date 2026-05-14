import PageHero   from '../components/PageHero'
import Coaches    from '../components/Coaches'
import BookingCTA from '../components/BookingCTA'
import { useSiteContent } from '../context/SiteContentContext'

export default function CoachesPage({ onBook }) {
  const { content } = useSiteContent()
  return (
    <>
      <PageHero {...content.pageHero.coaches} />
      <Coaches />
      <BookingCTA onBook={onBook} />
    </>
  )
}
