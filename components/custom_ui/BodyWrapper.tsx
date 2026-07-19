export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  return <div className="container mx-auto py-8 not-sm:px-2 space-y-8">{children}</div>;
}
