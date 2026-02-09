import { redirect } from 'next/navigation'

export default function ReadRedirect() {
  // Feed yok: herkes kendi profili uzerinden paylasiyor.
  redirect('/dashboard')
}
