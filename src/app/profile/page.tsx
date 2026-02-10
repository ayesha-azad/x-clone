import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma";

const ProfilePage = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { username: true },
  });

  if (!dbUser) {
    redirect("/");
  }

  redirect(`/${dbUser.username}`);
};

export default ProfilePage;
