import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle } from "lucide-react";
const BackButton = () => {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()} variant={"link"} size={"icon"} className="group">
      <ArrowLeftCircle className="size-8 group-hover:stroke-violet-800 transition-colors duration-300" />
    </Button>
  );
};

export default BackButton;
