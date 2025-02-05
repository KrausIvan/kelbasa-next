import { signIn, auth } from "@/libs/auth";

const LoggedUserServer = async () => {
  const session = await auth();

  if (!session) {
    return (
      <form action={async () => {
        "use server"
         await signIn("github", {redirectTo: "/admin/dashboard"});
        }}
      >
        <button style={{backgroundColor: "white", border: "solid 1px gray", color: "black", padding: 5}} type="submit">Signin with GitHub</button>
      </form>
    );
  }

  return <p>Přihlášen jako: {session.user!.email}</p>;
};

export default LoggedUserServer;