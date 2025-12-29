import { signIn } from '@/auth'
import { GoogleSubmitBtn } from './google-submit-btn'

export const LoginGoogleButton = () => {
  return (
    <form action={async () => {
      "use server";
      await signIn('google', { redirectTo: "/dashboard" })
    }} >
      <GoogleSubmitBtn />
    </form>
  )
}
