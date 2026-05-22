import { useAuth } from "../context/AuthContext";

const BodyWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isUserPending } = useAuth();
  if (isUserPending) return null;
  return <main className="size-full mx-auto max-w-4/5 p-2 dark:bg-black sm:items-start">{children}</main>;
};

export default BodyWrapper;
