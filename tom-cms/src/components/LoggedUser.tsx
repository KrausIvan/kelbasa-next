import { auth } from "@/libs/auth"

const LoggedUser = async () => {
  const session = await auth();
  console.log(session);
  return session ? <>{session.user!.email}</> : <>Nepřihlášený uživatel</>
}

export default LoggedUser;