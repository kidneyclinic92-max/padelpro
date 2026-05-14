import PageHero   from '../components/PageHero'
import Membership from '../components/Membership'
import BookingCTA from '../components/BookingCTA'
import { useSiteContent } from '../context/SiteContentContext'

export default function MembershipPage({ onBook }) {
  const { content } = useSiteContent()
  return (
    <>
      <PageHero {...content.pageHero.membership} />
      <Membership onBook={onBook} />
      <BookingCTA onBook={onBook} />
    </>
  )
}
