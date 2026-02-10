import LeftBar from "@/components/LeftBar";
import RightBar from "@/components/RightBar";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/prisma";

export default async function BoardLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const user = await currentUser();

  if (user) {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      const username =
        user.username ||
        user.emailAddresses[0].emailAddress.split("@")[0] +
          Math.floor(Math.random() * 1000);
      try {
        await prisma.user.create({
          data: {
            id: user.id,
            username,
            email: user.emailAddresses[0].emailAddress,
            img: user.imageUrl || "",
            displayName: user.firstName
              ? `${user.firstName} ${user.lastName || ""}`
              : null,
          },
        });
      } catch (err) {
        console.error("Auto-sync error:", err);
      }
    }
  }

  return (
    <div className="max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl xxl:max-w-screen-xxl mx-auto flex justify-between">
      <div className="px-2 xsm:px-4 xxl:px-8 ">
        <LeftBar />
      </div>
      <div className="flex-1 lg:min-w-[600px] border-x-[1px] border-borderGray ">
        {children}
        {modal}
      </div>
      <div className="hidden lg:flex ml-4 md:ml-8 flex-1 ">
        <RightBar />
      </div>
    </div>
  );
}
